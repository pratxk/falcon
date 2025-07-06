import Redis from 'ioredis';
import { logger } from './logger';

class RedisService {
  private static instance: RedisService;
  private redis: Redis | null = null;
  private isConnected = false;
  private retryAttempts = 0;
  private maxRetries = 5;
  private retryDelay = 2000; // 2 seconds

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private getRedisConfig() {
    const redisHost = process.env.REDIS_HOST;
    
    // If using Upstash Redis
    if (redisHost?.includes('upstash.io')) {
      const username = process.env.REDIS_USERNAME || 'default';
      const password = process.env.REDIS_PASSWORD;
      const port = process.env.REDIS_PORT || '6379';
      
      logger.info(`Connecting to Upstash Redis: ${redisHost}`);
      logger.debug(`Redis config - Host: ${redisHost}, Port: ${port}, Username: ${username}`);
      
      return {
        host: redisHost,
        port: parseInt(port),
        username: username,
        password: password,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: null, // Disable retry limit for connection
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        tls: {}, // Enable TLS for Upstash
        retryDelayOnClusterDown: 300,
        enableReadyCheck: true,
      };
    }
    
    // For local Redis
    logger.info(`Connecting to local Redis: ${redisHost || 'localhost'}`);
    return {
      host: redisHost || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    };
  }

  async connect(): Promise<Redis> {
    if (this.redis && this.isConnected) {
      return this.redis;
    }

    try {
      logger.info('Initializing Redis connection...');
      
      const config = this.getRedisConfig();
      this.redis = new Redis(config);

      // Set up event listeners
      this.redis.on('error', (error) => {
        logger.error('Redis connection error:', error);
        this.isConnected = false;
      });

      this.redis.on('connect', () => {
        logger.info('Redis connected');
        this.isConnected = true;
        this.retryAttempts = 0;
      });

      this.redis.on('ready', () => {
        logger.info('Redis is ready');
        this.isConnected = true;
      });

      this.redis.on('close', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      // Test the connection
      await this.redis.ping();
      logger.info('Redis connection test successful');
      
      return this.redis;
    } catch (error) {
      this.retryAttempts++;
      logger.error(`Redis connection attempt ${this.retryAttempts} failed:`, error);
      
      if (this.retryAttempts < this.maxRetries) {
        logger.info(`Retrying Redis connection in ${this.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connect();
      } else {
        logger.error('Max Redis connection retries reached');
        throw new Error(`Failed to connect to Redis after ${this.maxRetries} attempts`);
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit();
        this.isConnected = false;
        this.redis = null;
        logger.info('Redis disconnected');
      } catch (error) {
        logger.error('Error disconnecting from Redis:', error);
      }
    }
  }

  getClient(): Redis | null {
    return this.redis;
  }

  isRedisConnected(): boolean {
    return this.isConnected;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.redis) {
        return false;
      }
      
      await this.redis.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  async getStats(): Promise<{ keys: number; memory: string }> {
    try {
      if (!this.redis) {
        return { keys: 0, memory: 'Unknown' };
      }
      
      const info = await this.redis.info('memory');
      const keys = await this.redis.dbsize();
      
      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const memory = memoryMatch && memoryMatch[1] !== undefined ? memoryMatch[1] : 'Unknown';

      return { keys, memory };
    } catch (error) {
      logger.error('Redis stats error:', error);
      return { keys: 0, memory: 'Unknown' };
    }
  }
}

export const redisService = RedisService.getInstance();

// Export a function to get the Redis client
export async function getRedisClient(): Promise<Redis> {
  return await redisService.connect();
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down Redis...');
  await redisService.disconnect();
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down Redis...');
  await redisService.disconnect();
}); 