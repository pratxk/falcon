"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cache_1 = require("../utils/cache");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/stats', async (req, res) => {
    try {
        const stats = await cache_1.cacheService.getStats();
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        logger_1.logger.error('Cache stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cache statistics',
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        const isHealthy = await cache_1.cacheService.healthCheck();
        res.json({
            success: true,
            healthy: isHealthy,
        });
    }
    catch (error) {
        logger_1.logger.error('Cache health check error:', error);
        res.status(500).json({
            success: false,
            healthy: false,
            error: 'Cache health check failed',
        });
    }
});
router.delete('/clear/:prefix', async (req, res) => {
    try {
        const { prefix } = req.params;
        await cache_1.cacheService.clearPrefix(prefix);
        res.json({
            success: true,
            message: `Cleared cache for prefix: ${prefix}`,
        });
    }
    catch (error) {
        logger_1.logger.error('Cache clear error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear cache',
        });
    }
});
router.delete('/clear', async (req, res) => {
    try {
        await cache_1.cacheService.clearPrefix('graphql');
        res.json({
            success: true,
            message: 'Cleared all GraphQL cache',
        });
    }
    catch (error) {
        logger_1.logger.error('Cache clear all error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear all cache',
        });
    }
});
router.get('/keys/:pattern', async (req, res) => {
    try {
        const { pattern } = req.params;
        const keys = await cache_1.cacheService.getKeysByPattern(pattern);
        res.json({
            success: true,
            data: keys,
        });
    }
    catch (error) {
        logger_1.logger.error('Cache keys error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cache keys',
        });
    }
});
exports.default = router;
//# sourceMappingURL=cache.js.map