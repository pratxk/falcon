import { PrismaClient } from '@prisma/client';
declare class DatabaseService {
    private static instance;
    private prisma;
    private isConnected;
    private retryAttempts;
    private maxRetries;
    private retryDelay;
    static getInstance(): DatabaseService;
    connect(): Promise<PrismaClient>;
    disconnect(): Promise<void>;
    getClient(): PrismaClient | null;
    isDatabaseConnected(): boolean;
    healthCheck(): Promise<boolean>;
}
export declare const databaseService: DatabaseService;
export declare function getPrismaClient(): Promise<PrismaClient>;
export {};
//# sourceMappingURL=database.d.ts.map