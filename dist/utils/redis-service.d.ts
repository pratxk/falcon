import Redis from 'ioredis';
declare class RedisService {
    private static instance;
    private redis;
    private isConnected;
    private retryAttempts;
    private maxRetries;
    private retryDelay;
    static getInstance(): RedisService;
    private getRedisConfig;
    connect(): Promise<Redis>;
    disconnect(): Promise<void>;
    getClient(): Redis | null;
    isRedisConnected(): boolean;
    healthCheck(): Promise<boolean>;
    getStats(): Promise<{
        keys: number;
        memory: string;
    }>;
}
export declare const redisService: RedisService;
export declare function getRedisClient(): Promise<Redis>;
export {};
//# sourceMappingURL=redis-service.d.ts.map