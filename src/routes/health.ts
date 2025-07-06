import express from 'express';
import { databaseService } from '../utils/database';
import { cacheService } from '../utils/cache';
import { logger } from '../utils/logger';

const router = express.Router();

// Overall health check
router.get('/', async (req, res) => {
  try {
    const dbHealth = await databaseService.healthCheck();
    const cacheHealth = await cacheService.healthCheck();
    
    const isHealthy = dbHealth && cacheHealth;
    
    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbHealth ? 'healthy' : 'unhealthy',
        },
        cache: {
          status: cacheHealth ? 'healthy' : 'unhealthy',
        },
      },
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Database health check
router.get('/database', async (req, res) => {
  try {
    const isHealthy = await databaseService.healthCheck();
    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      connected: databaseService.isDatabaseConnected(),
    });
  } catch (error) {
    logger.error('Database health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database health check failed',
    });
  }
});

// Cache health check
router.get('/cache', async (req, res) => {
  try {
    const isHealthy = await cacheService.healthCheck();
    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Cache health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Cache health check failed',
    });
  }
});

export default router; 