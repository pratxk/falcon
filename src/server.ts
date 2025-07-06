import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';

import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { authMiddleware } from './middleware/auth';
import { logger } from './utils/logger';
import { redis } from './utils/redis';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

interface Context {
  prisma: PrismaClient;
  user?: any;
  redis: typeof redis;
}

async function startServer() {
  try {
    // Create Express app
    const app = express();
    const httpServer = createServer(app);

    // Create Apollo Server
    const server = new ApolloServer<Context>({
      typeDefs,
      resolvers,
      introspection: process.env.NODE_ENV !== 'production',
      includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
    });

    // Start Apollo Server
    await server.start();

    // Apply middleware
    app.use(
      '/graphql',
      cors<cors.CorsRequest>({
        origin: [
          process.env.CORS_ORIGIN || 'http://localhost:3000',
          'https://studio.apollographql.com',
          'https://studio.apollographql.com/sandbox',
          'http://localhost:4000'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
      express.json({ limit: '10mb' }),
      authMiddleware,
      expressMiddleware(server, {
        context: async ({ req }): Promise<Context> => ({
          prisma,
          user: (req as any).user,
          redis,
        }),
      })
    );

    // Health check endpoint
    app.get('/', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
      logger.info(`📊 GraphQL Playground available in development mode`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      await prisma.$disconnect();
      await redis.quit();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();