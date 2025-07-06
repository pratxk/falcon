import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';

import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { authMiddleware } from './middleware/auth';
import { logger } from './utils/logger';
import { redisService } from './utils/redis-service';
import { databaseService } from './utils/database';
import cacheRoutes from './routes/cache';
import healthRoutes from './routes/health';
import { setupWebSocketServer } from './websocket/server';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;

interface Context {
  prisma: any;
  user?: any;
  redis: any;
}

async function startServer() {
  try {
    // Connect to database
    const prisma = await databaseService.connect();
    
    // Connect to Redis
    await redisService.connect();
    
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
      express.json(),
      authMiddleware,
      expressMiddleware(server, {
        context: async ({ req }): Promise<Context> => ({
          prisma,
          user: (req as any).user,
          redis: await redisService.getClient(),
        }),
      })
    );

    // Health check endpoint
    app.get('/', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Health check routes
    app.use('/api/health', healthRoutes);
    
    // Cache management routes
    app.use('/api/cache', cacheRoutes);

    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
      logger.info(`📊 GraphQL Playground available in development mode`);
    });

    // Attach websocket server
    setupWebSocketServer(httpServer);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      await databaseService.disconnect();
      await redisService.disconnect();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();