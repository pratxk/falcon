import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient | null = null;
  private isConnected = false;
  private retryAttempts = 0;
  private maxRetries = 5;
  private retryDelay = 2000; // 2 seconds

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect(): Promise<PrismaClient> {
    if (this.prisma && this.isConnected) {
      return this.prisma;
    }

    try {
      logger.info('Connecting to database...');
      
      this.prisma = new PrismaClient({
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

      // Add event listeners for better debugging
      (this.prisma as any).$on('query', (e: any) => {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Params: ${e.params}`);
        logger.debug(`Duration: ${e.duration}ms`);
      });

      (this.prisma as any).$on('error', (e: any) => {
        logger.error('Database error:', e);
      });

      // Test the connection
      await this.prisma.$connect();
      
      // Verify connection with a simple query
      await this.prisma.$queryRaw`SELECT 1`;
      
      this.isConnected = true;
      this.retryAttempts = 0;
      logger.info('Database connected successfully');
      
      return this.prisma;
    } catch (error) {
      this.retryAttempts++;
      logger.error(`Database connection attempt ${this.retryAttempts} failed:`, error);
      
      if (this.retryAttempts < this.maxRetries) {
        logger.info(`Retrying database connection in ${this.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connect();
      } else {
        logger.error('Max database connection retries reached');
        throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`);
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.prisma) {
      try {
        await this.prisma.$disconnect();
        this.isConnected = false;
        this.prisma = null;
        logger.info('Database disconnected');
      } catch (error) {
        logger.error('Error disconnecting from database:', error);
      }
    }
  }

  getClient(): PrismaClient | null {
    return this.prisma;
  }

  isDatabaseConnected(): boolean {
    return this.isConnected;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.prisma) {
        return false;
      }
      
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

export const databaseService = DatabaseService.getInstance();

// Export a function to get the Prisma client
export async function getPrismaClient(): Promise<PrismaClient> {
  return await databaseService.connect();
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down database...');
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down database...');
  await databaseService.disconnect();
  process.exit(0);
}); 