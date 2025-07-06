import { getRedisClient, redisService } from './redis-service';

// Export the Redis service for direct access
export { redisService, getRedisClient };

// For backward compatibility, export a redis instance
let redisInstance: any = null;

export const redis = {
  async getClient() {
    if (!redisInstance) {
      redisInstance = await getRedisClient();
    }
    return redisInstance;
  },
  
  async set(key: string, value: string, ttl?: number) {
    const client = await this.getClient();
    if (ttl) {
      return await client.setex(key, ttl, value);
    }
    return await client.set(key, value);
  },
  
  async get(key: string) {
    const client = await this.getClient();
    return await client.get(key);
  },
  
  async exists(key: string) {
    const client = await this.getClient();
    return await client.exists(key);
  },
  
  async ping() {
    const client = await this.getClient();
    return await client.ping();
  },
  
  async keys(pattern: string) {
    const client = await this.getClient();
    return await client.keys(pattern);
  },
  
  async dbsize() {
    const client = await this.getClient();
    return await client.dbsize();
  },
  
  async info(section?: string) {
    const client = await this.getClient();
    return await client.info(section);
  },
  
  async setex(key: string, ttl: number, value: string) {
    const client = await this.getClient();
    return await client.setex(key, ttl, value);
  },
  
  async del(...keys: string[]) {
    const client = await this.getClient();
    return await client.del(...keys);
  }
};
