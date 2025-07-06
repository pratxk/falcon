import { getRedisClient } from './redis-service';
import { logger } from './logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  key?: string;
}

export class CacheService {
  private static instance: CacheService;
  private defaultTTL = 300; // 5 minutes default

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Generate cache key
   */
  private generateKey(prefix: string, key: string): string {
    return `${prefix}:${key}`;
  }

  /**
   * Get data from cache
   */
  async get<T>(key: string, prefix: string = 'graphql'): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(prefix, key);
      const redis = await getRedisClient();
      const data = await redis.get(cacheKey);
      
      if (data) {
        logger.debug(`Cache hit for key: ${cacheKey}`);
        return JSON.parse(data);
      }
      
      logger.debug(`Cache miss for key: ${cacheKey}`);
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = this.defaultTTL, prefix = 'graphql' } = options;
      const cacheKey = this.generateKey(prefix, key);
      const redis = await getRedisClient();
      
      await redis.setex(cacheKey, ttl, JSON.stringify(data));
      logger.debug(`Cached data for key: ${cacheKey} with TTL: ${ttl}s`);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string, prefix: string = 'graphql'): Promise<void> {
    try {
      const cacheKey = this.generateKey(prefix, key);
      const redis = await getRedisClient();
      await redis.del(cacheKey);
      logger.debug(`Deleted cache key: ${cacheKey}`);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple cache entries by pattern
   */
  async deletePattern(pattern: string, prefix: string = 'graphql'): Promise<void> {
    try {
      const fullPattern = this.generateKey(prefix, pattern);
      const redis = await getRedisClient();
      const keys = await redis.keys(fullPattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug(`Deleted ${keys.length} cache keys matching pattern: ${fullPattern}`);
      }
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Clear all cache for a specific prefix
   */
  async clearPrefix(prefix: string = 'graphql'): Promise<void> {
    try {
      const pattern = `${prefix}:*`;
      const redis = await getRedisClient();
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug(`Cleared ${keys.length} cache keys for prefix: ${prefix}`);
      }
    } catch (error) {
      logger.error('Cache clear prefix error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ keys: number; memory: string }> {
    try {
      const redis = await getRedisClient();
      const info = await redis.info('memory');
      const keys = await redis.dbsize();
      
      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const memory = memoryMatch ? memoryMatch[1] : 'Unknown';
      
      return { keys, memory };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return { keys: 0, memory: 'Unknown' };
    }
  }

  /**
   * Get cache keys by pattern
   */
  async getKeysByPattern(pattern: string): Promise<string[]> {
    try {
      const redis = await getRedisClient();
      const keys = await redis.keys(pattern);
      return keys;
    } catch (error) {
      logger.error('Cache get keys error:', error);
      return [];
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const redis = await getRedisClient();
      await redis.ping();
      return true;
    } catch (error) {
      logger.error('Cache health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();

// Cache decorator for resolvers
export function withCache<T extends any[], R>(
  keyGenerator: (...args: T) => string,
  options: CacheOptions = {}
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const cacheKey = keyGenerator(...args);
      
      // Try to get from cache first
      const cached = await cacheService.get<R>(cacheKey, options.prefix);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await method.apply(this, args);
      
      // Cache the result
      await cacheService.set(cacheKey, result, options);
      
      return result;
    };
  };
}

// Cache key generators
export const cacheKeys = {
  missions: (organizationId: string, status?: string) => 
    `missions:${organizationId}${status ? `:${status}` : ''}`,
  
  mission: (id: string) => 
    `mission:${id}`,
  
  myMissions: (userId: string) => 
    `myMissions:${userId}`,
  
  activeMissions: (organizationId: string) => 
    `activeMissions:${organizationId}`,
  
  drones: (organizationId: string) => 
    `drones:${organizationId}`,
  
  drone: (id: string) => 
    `drone:${id}`,
  
  availableDrones: (organizationId: string) => 
    `availableDrones:${organizationId}`,
  
  sites: (organizationId: string) => 
    `sites:${organizationId}`,
  
  site: (id: string) => 
    `site:${id}`,
  
  users: (organizationId: string) => 
    `users:${organizationId}`,
  
  user: (id: string) => 
    `user:${id}`,
  
  organization: (id: string) => 
    `organization:${id}`,
  
  organizationStats: (organizationId: string) => 
    `organizationStats:${organizationId}`,
};

// Cache invalidation helpers
export const cacheInvalidation = {
  missions: async (organizationId: string) => {
    await cacheService.deletePattern(`missions:${organizationId}*`);
    await cacheService.deletePattern(`activeMissions:${organizationId}*`);
  },
  
  mission: async (missionId: string, organizationId: string) => {
    await cacheService.delete(cacheKeys.mission(missionId));
    await cacheService.deletePattern(`missions:${organizationId}*`);
    await cacheService.deletePattern(`activeMissions:${organizationId}*`);
  },
  
  drones: async (organizationId: string) => {
    await cacheService.deletePattern(`drones:${organizationId}*`);
    await cacheService.deletePattern(`availableDrones:${organizationId}*`);
  },
  
  drone: async (droneId: string, organizationId: string) => {
    await cacheService.delete(cacheKeys.drone(droneId));
    await cacheService.deletePattern(`drones:${organizationId}*`);
    await cacheService.deletePattern(`availableDrones:${organizationId}*`);
  },
  
  sites: async (organizationId: string) => {
    await cacheService.deletePattern(`sites:${organizationId}*`);
  },
  
  site: async (siteId: string, organizationId: string) => {
    await cacheService.delete(cacheKeys.site(siteId));
    await cacheService.deletePattern(`sites:${organizationId}*`);
  },
  
  users: async (organizationId: string) => {
    await cacheService.deletePattern(`users:${organizationId}*`);
  },
  
  user: async (userId: string, organizationId: string) => {
    await cacheService.delete(cacheKeys.user(userId));
    await cacheService.deletePattern(`users:${organizationId}*`);
  },
  
  organization: async (organizationId: string) => {
    await cacheService.delete(cacheKeys.organization(organizationId));
    await cacheService.delete(cacheKeys.organizationStats(organizationId));
  },
}; 