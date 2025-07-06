"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseService = void 0;
exports.getPrismaClient = getPrismaClient;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
class DatabaseService {
    constructor() {
        this.prisma = null;
        this.isConnected = false;
        this.retryAttempts = 0;
        this.maxRetries = 5;
        this.retryDelay = 2000;
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    async connect() {
        if (this.prisma && this.isConnected) {
            return this.prisma;
        }
        try {
            logger_1.logger.info('Connecting to database...');
            this.prisma = new client_1.PrismaClient({
                log: [
                    {
                        emit: 'event',
                        level: 'query',
                    },
                    {
                        emit: 'event',
                        level: 'error',
                    },
                    {
                        emit: 'event',
                        level: 'info',
                    },
                    {
                        emit: 'event',
                        level: 'warn',
                    },
                ],
                datasources: {
                    db: {
                        url: process.env.DATABASE_URL,
                    },
                },
            });
            this.prisma.$on('query', (e) => {
                logger_1.logger.debug(`Query: ${e.query}`);
                logger_1.logger.debug(`Params: ${e.params}`);
                logger_1.logger.debug(`Duration: ${e.duration}ms`);
            });
            this.prisma.$on('error', (e) => {
                logger_1.logger.error('Database error:', e);
            });
            await this.prisma.$connect();
            await this.prisma.$queryRaw `SELECT 1`;
            this.isConnected = true;
            this.retryAttempts = 0;
            logger_1.logger.info('Database connected successfully');
            return this.prisma;
        }
        catch (error) {
            this.retryAttempts++;
            logger_1.logger.error(`Database connection attempt ${this.retryAttempts} failed:`, error);
            if (this.retryAttempts < this.maxRetries) {
                logger_1.logger.info(`Retrying database connection in ${this.retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.connect();
            }
            else {
                logger_1.logger.error('Max database connection retries reached');
                throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`);
            }
        }
    }
    async disconnect() {
        if (this.prisma) {
            try {
                await this.prisma.$disconnect();
                this.isConnected = false;
                this.prisma = null;
                logger_1.logger.info('Database disconnected');
            }
            catch (error) {
                logger_1.logger.error('Error disconnecting from database:', error);
            }
        }
    }
    getClient() {
        return this.prisma;
    }
    isDatabaseConnected() {
        return this.isConnected;
    }
    async healthCheck() {
        try {
            if (!this.prisma) {
                return false;
            }
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            logger_1.logger.error('Database health check failed:', error);
            return false;
        }
    }
}
exports.databaseService = DatabaseService.getInstance();
async function getPrismaClient() {
    return await exports.databaseService.connect();
}
process.on('SIGINT', async () => {
    logger_1.logger.info('Received SIGINT, shutting down database...');
    await exports.databaseService.disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    logger_1.logger.info('Received SIGTERM, shutting down database...');
    await exports.databaseService.disconnect();
    process.exit(0);
});
//# sourceMappingURL=database.js.map