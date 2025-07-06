"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheInvalidation = exports.cacheKeys = exports.cacheService = exports.CacheService = void 0;
exports.withCache = withCache;
const redis_service_1 = require("./redis-service");
const logger_1 = require("./logger");
class CacheService {
    constructor() {
        this.defaultTTL = 300;
    }
    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }
    generateKey(prefix, key) {
        return `${prefix}:${key}`;
    }
    async get(key, prefix = 'graphql') {
        try {
            const cacheKey = this.generateKey(prefix, key);
            const redis = await (0, redis_service_1.getRedisClient)();
            const data = await redis.get(cacheKey);
            if (data) {
                logger_1.logger.debug(`Cache hit for key: ${cacheKey}`);
                return JSON.parse(data);
            }
            logger_1.logger.debug(`Cache miss for key: ${cacheKey}`);
            return null;
        }
        catch (error) {
            logger_1.logger.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, data, options = {}) {
        try {
            const { ttl = this.defaultTTL, prefix = 'graphql' } = options;
            const cacheKey = this.generateKey(prefix, key);
            const redis = await (0, redis_service_1.getRedisClient)();
            await redis.setex(cacheKey, ttl, JSON.stringify(data));
            logger_1.logger.debug(`Cached data for key: ${cacheKey} with TTL: ${ttl}s`);
        }
        catch (error) {
            logger_1.logger.error('Cache set error:', error);
        }
    }
    async delete(key, prefix = 'graphql') {
        try {
            const cacheKey = this.generateKey(prefix, key);
            const redis = await (0, redis_service_1.getRedisClient)();
            await redis.del(cacheKey);
            logger_1.logger.debug(`Deleted cache key: ${cacheKey}`);
        }
        catch (error) {
            logger_1.logger.error('Cache delete error:', error);
        }
    }
    async deletePattern(pattern, prefix = 'graphql') {
        try {
            const fullPattern = this.generateKey(prefix, pattern);
            const redis = await (0, redis_service_1.getRedisClient)();
            const keys = await redis.keys(fullPattern);
            if (keys.length > 0) {
                await redis.del(...keys);
                logger_1.logger.debug(`Deleted ${keys.length} cache keys matching pattern: ${fullPattern}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Cache delete pattern error:', error);
        }
    }
    async clearPrefix(prefix = 'graphql') {
        try {
            const pattern = `${prefix}:*`;
            const redis = await (0, redis_service_1.getRedisClient)();
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
                logger_1.logger.debug(`Cleared ${keys.length} cache keys for prefix: ${prefix}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Cache clear prefix error:', error);
        }
    }
    async getStats() {
        try {
            const redis = await (0, redis_service_1.getRedisClient)();
            const info = await redis.info('memory');
            const keys = await redis.dbsize();
            const memoryMatch = info.match(/used_memory_human:(\S+)/);
            const memory = memoryMatch && memoryMatch[1] !== undefined ? memoryMatch[1] : 'Unknown';
            return { keys, memory };
        }
        catch (error) {
            logger_1.logger.error('Cache stats error:', error);
            return { keys: 0, memory: 'Unknown' };
        }
    }
    async getKeysByPattern(pattern) {
        try {
            const redis = await (0, redis_service_1.getRedisClient)();
            const keys = await redis.keys(pattern);
            return keys;
        }
        catch (error) {
            logger_1.logger.error('Cache get keys error:', error);
            return [];
        }
    }
    async healthCheck() {
        try {
            const redis = await (0, redis_service_1.getRedisClient)();
            await redis.ping();
            return true;
        }
        catch (error) {
            logger_1.logger.error('Cache health check failed:', error);
            return false;
        }
    }
}
exports.CacheService = CacheService;
exports.cacheService = CacheService.getInstance();
function withCache(keyGenerator, options = {}) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const cacheKey = keyGenerator(...args);
            const cached = await exports.cacheService.get(cacheKey, options.prefix);
            if (cached !== null) {
                return cached;
            }
            const result = await method.apply(this, args);
            await exports.cacheService.set(cacheKey, result, options);
            return result;
        };
    };
}
exports.cacheKeys = {
    missions: (organizationId, status) => `missions:${organizationId}${status ? `:${status}` : ''}`,
    mission: (id) => `mission:${id}`,
    myMissions: (userId) => `myMissions:${userId}`,
    activeMissions: (organizationId) => `activeMissions:${organizationId}`,
    drones: (organizationId) => `drones:${organizationId}`,
    drone: (id) => `drone:${id}`,
    availableDrones: (organizationId) => `availableDrones:${organizationId}`,
    sites: (organizationId) => `sites:${organizationId}`,
    site: (id) => `site:${id}`,
    users: (organizationId) => `users:${organizationId}`,
    user: (id) => `user:${id}`,
    organization: (id) => `organization:${id}`,
    organizationStats: (organizationId) => `organizationStats:${organizationId}`,
};
exports.cacheInvalidation = {
    missions: async (organizationId) => {
        await exports.cacheService.deletePattern(`missions:${organizationId}*`);
        await exports.cacheService.deletePattern(`activeMissions:${organizationId}*`);
    },
    mission: async (missionId, organizationId) => {
        await exports.cacheService.delete(exports.cacheKeys.mission(missionId));
        await exports.cacheService.deletePattern(`missions:${organizationId}*`);
        await exports.cacheService.deletePattern(`activeMissions:${organizationId}*`);
    },
    drones: async (organizationId) => {
        await exports.cacheService.deletePattern(`drones:${organizationId}*`);
        await exports.cacheService.deletePattern(`availableDrones:${organizationId}*`);
    },
    drone: async (droneId, organizationId) => {
        await exports.cacheService.delete(exports.cacheKeys.drone(droneId));
        await exports.cacheService.deletePattern(`drones:${organizationId}*`);
        await exports.cacheService.deletePattern(`availableDrones:${organizationId}*`);
    },
    sites: async (organizationId) => {
        await exports.cacheService.deletePattern(`sites:${organizationId}*`);
    },
    site: async (siteId, organizationId) => {
        await exports.cacheService.delete(exports.cacheKeys.site(siteId));
        await exports.cacheService.deletePattern(`sites:${organizationId}*`);
    },
    users: async (organizationId) => {
        await exports.cacheService.deletePattern(`users:${organizationId}*`);
    },
    user: async (userId, organizationId) => {
        await exports.cacheService.delete(exports.cacheKeys.user(userId));
        await exports.cacheService.deletePattern(`users:${organizationId}*`);
    },
    organization: async (organizationId) => {
        await exports.cacheService.delete(exports.cacheKeys.organization(organizationId));
        await exports.cacheService.delete(exports.cacheKeys.organizationStats(organizationId));
    },
};
//# sourceMappingURL=cache.js.map