import { getRedisClient, redisService } from './redis-service';
export { redisService, getRedisClient };
export declare const redis: {
    getClient(): Promise<any>;
    set(key: string, value: string, ttl?: number): Promise<any>;
    get(key: string): Promise<any>;
    exists(key: string): Promise<any>;
    ping(): Promise<any>;
    keys(pattern: string): Promise<any>;
    dbsize(): Promise<any>;
    info(section?: string): Promise<any>;
    setex(key: string, ttl: number, value: string): Promise<any>;
    del(...keys: string[]): Promise<any>;
};
//# sourceMappingURL=redis.d.ts.map