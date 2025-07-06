import express from 'express';
import { cacheService } from '../utils/cache';
import { logger } from '../utils/logger';

const router = express.Router();

// Get cache statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await cacheService.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Cache stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics',
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await cacheService.healthCheck();
    res.json({
      success: true,
      healthy: isHealthy,
    });
  } catch (error) {
    logger.error('Cache health check error:', error);
    res.status(500).json({
      success: false,
      healthy: false,
      error: 'Cache health check failed',
    });
  }
});

// Clear specific cache prefix
router.delete('/clear/:prefix', async (req, res) => {
  try {
    const { prefix } = req.params;
    await cacheService.clearPrefix(prefix);
    res.json({
      success: true,
      message: `Cleared cache for prefix: ${prefix}`,
    });
  } catch (error) {
    logger.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
});

// Clear all cache
router.delete('/clear', async (req, res) => {
  try {
    await cacheService.clearPrefix('graphql');
    res.json({
      success: true,
      message: 'Cleared all GraphQL cache',
    });
  } catch (error) {
    logger.error('Cache clear all error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear all cache',
    });
  }
});

// Get cache keys by pattern
router.get('/keys/:pattern', async (req, res) => {
  try {
    const { pattern } = req.params;
    const keys = await cacheService.getKeysByPattern(pattern);
    res.json({
      success: true,
      data: keys,
    });
  } catch (error) {
    logger.error('Cache keys error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache keys',
    });
  }
});

export default router; 