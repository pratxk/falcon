"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
exports.getRedisClient = getRedisClient;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("./logger");
class RedisService {
    constructor() {
        this.redis = null;
        this.isConnected = false;
        this.retryAttempts = 0;
        this.maxRetries = 5;
        this.retryDelay = 2000;
    }
    static getInstance() {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }
    getRedisConfig() {
        const redisHost = process.env.REDIS_HOST;
        if (redisHost?.includes('upstash.io')) {
            const username = process.env.REDIS_USERNAME || 'default';
            const password = process.env.REDIS_PASSWORD;
            const port = process.env.REDIS_PORT || '6379';
            logger_1.logger.info(`Connecting to Upstash Redis: ${redisHost}`);
            logger_1.logger.debug(`Redis config - Host: ${redisHost}, Port: ${port}, Username: ${username}`);
            return {
                host: redisHost,
                port: parseInt(port),
                username: username,
                password: password,
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: null,
                lazyConnect: true,
                connectTimeout: 10000,
                commandTimeout: 5000,
                tls: {},
                retryDelayOnClusterDown: 300,
                enableReadyCheck: true,
            };
        }
        logger_1.logger.info(`Connecting to local Redis: ${redisHost || 'localhost'}`);
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
    async connect() {
        if (this.redis && this.isConnected) {
            return this.redis;
        }
        try {
            logger_1.logger.info('Initializing Redis connection...');
            const config = this.getRedisConfig();
            this.redis = new ioredis_1.default(config);
            this.redis.on('error', (error) => {
                logger_1.logger.error('Redis connection error:', error);
                this.isConnected = false;
            });
            this.redis.on('connect', () => {
                logger_1.logger.info('Redis connected');
                this.isConnected = true;
                this.retryAttempts = 0;
            });
            this.redis.on('ready', () => {
                logger_1.logger.info('Redis is ready');
                this.isConnected = true;
            });
            this.redis.on('close', () => {
                logger_1.logger.warn('Redis connection closed');
                this.isConnected = false;
            });
            this.redis.on('reconnecting', () => {
                logger_1.logger.info('Redis reconnecting...');
            });
            await this.redis.ping();
            logger_1.logger.info('Redis connection test successful');
            return this.redis;
        }
        catch (error) {
            this.retryAttempts++;
            logger_1.logger.error(`Redis connection attempt ${this.retryAttempts} failed:`, error);
            if (this.retryAttempts < this.maxRetries) {
                logger_1.logger.info(`Retrying Redis connection in ${this.retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.connect();
            }
            else {
                logger_1.logger.error('Max Redis connection retries reached');
                throw new Error(`Failed to connect to Redis after ${this.maxRetries} attempts`);
            }
        }
    }
    async disconnect() {
        if (this.redis) {
            try {
                await this.redis.quit();
                this.isConnected = false;
                this.redis = null;
                logger_1.logger.info('Redis disconnected');
            }
            catch (error) {
                logger_1.logger.error('Error disconnecting from Redis:', error);
            }
        }
    }
    getClient() {
        return this.redis;
    }
    isRedisConnected() {
        return this.isConnected;
    }
    async healthCheck() {
        try {
            if (!this.redis) {
                return false;
            }
            await this.redis.ping();
            return true;
        }
        catch (error) {
            logger_1.logger.error('Redis health check failed:', error);
            return false;
        }
    }
    async getStats() {
        try {
            if (!this.redis) {
                return { keys: 0, memory: 'Unknown' };
            }
            const info = await this.redis.info('memory');
            const keys = await this.redis.dbsize();
            const memoryMatch = info.match(/used_memory_human:(\S+)/);
            const memory = memoryMatch && memoryMatch[1] !== undefined ? memoryMatch[1] : 'Unknown';
            return { keys, memory };
        }
        catch (error) {
            logger_1.logger.error('Redis stats error:', error);
            return { keys: 0, memory: 'Unknown' };
        }
    }
}
exports.redisService = RedisService.getInstance();
async function getRedisClient() {
    return await exports.redisService.connect();
}
process.on('SIGINT', async () => {
    logger_1.logger.info('Received SIGINT, shutting down Redis...');
    await exports.redisService.disconnect();
});
process.on('SIGTERM', async () => {
    logger_1.logger.info('Received SIGTERM, shutting down Redis...');
    await exports.redisService.disconnect();
});
//# sourceMappingURL=redis-service.js.map