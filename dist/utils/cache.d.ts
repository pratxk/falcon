export interface CacheOptions {
    ttl?: number;
    prefix?: string;
    key?: string;
}
export declare class CacheService {
    private static instance;
    private defaultTTL;
    static getInstance(): CacheService;
    private generateKey;
    get<T>(key: string, prefix?: string): Promise<T | null>;
    set<T>(key: string, data: T, options?: CacheOptions): Promise<void>;
    delete(key: string, prefix?: string): Promise<void>;
    deletePattern(pattern: string, prefix?: string): Promise<void>;
    clearPrefix(prefix?: string): Promise<void>;
    getStats(): Promise<{
        keys: number;
        memory: string;
    }>;
    getKeysByPattern(pattern: string): Promise<string[]>;
    healthCheck(): Promise<boolean>;
}
export declare const cacheService: CacheService;
export declare function withCache<T extends any[], R>(keyGenerator: (...args: T) => string, options?: CacheOptions): (target: any, propertyName: string, descriptor: PropertyDescriptor) => void;
export declare const cacheKeys: {
    missions: (organizationId: string, status?: string) => string;
    mission: (id: string) => string;
    myMissions: (userId: string) => string;
    activeMissions: (organizationId: string) => string;
    drones: (organizationId: string) => string;
    drone: (id: string) => string;
    availableDrones: (organizationId: string) => string;
    sites: (organizationId: string) => string;
    site: (id: string) => string;
    users: (organizationId: string) => string;
    user: (id: string) => string;
    organization: (id: string) => string;
    organizationStats: (organizationId: string) => string;
};
export declare const cacheInvalidation: {
    missions: (organizationId: string) => Promise<void>;
    mission: (missionId: string, organizationId: string) => Promise<void>;
    drones: (organizationId: string) => Promise<void>;
    drone: (droneId: string, organizationId: string) => Promise<void>;
    sites: (organizationId: string) => Promise<void>;
    site: (siteId: string, organizationId: string) => Promise<void>;
    users: (organizationId: string) => Promise<void>;
    user: (userId: string, organizationId: string) => Promise<void>;
    organization: (organizationId: string) => Promise<void>;
};
//# sourceMappingURL=cache.d.ts.map