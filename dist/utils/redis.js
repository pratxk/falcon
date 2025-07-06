"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.getRedisClient = exports.redisService = void 0;
const redis_service_1 = require("./redis-service");
Object.defineProperty(exports, "getRedisClient", { enumerable: true, get: function () { return redis_service_1.getRedisClient; } });
Object.defineProperty(exports, "redisService", { enumerable: true, get: function () { return redis_service_1.redisService; } });
let redisInstance = null;
exports.redis = {
    async getClient() {
        if (!redisInstance) {
            redisInstance = await (0, redis_service_1.getRedisClient)();
        }
        return redisInstance;
    },
    async set(key, value, ttl) {
        const client = await this.getClient();
        if (ttl) {
            return await client.setex(key, ttl, value);
        }
        return await client.set(key, value);
    },
    async get(key) {
        const client = await this.getClient();
        return await client.get(key);
    },
    async exists(key) {
        const client = await this.getClient();
        return await client.exists(key);
    },
    async ping() {
        const client = await this.getClient();
        return await client.ping();
    },
    async keys(pattern) {
        const client = await this.getClient();
        return await client.keys(pattern);
    },
    async dbsize() {
        const client = await this.getClient();
        return await client.dbsize();
    },
    async info(section) {
        const client = await this.getClient();
        return await client.info(section);
    },
    async setex(key, ttl, value) {
        const client = await this.getClient();
        return await client.setex(key, ttl, value);
    },
    async del(...keys) {
        const client = await this.getClient();
        return await client.del(...keys);
    }
};
//# sourceMappingURL=redis.js.map