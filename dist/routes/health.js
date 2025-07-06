"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../utils/database");
const cache_1 = require("../utils/cache");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const dbHealth = await database_1.databaseService.healthCheck();
        const cacheHealth = await cache_1.cacheService.healthCheck();
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
    }
    catch (error) {
        logger_1.logger.error('Health check error:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
        });
    }
});
router.get('/database', async (req, res) => {
    try {
        const isHealthy = await database_1.databaseService.healthCheck();
        res.json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            connected: database_1.databaseService.isDatabaseConnected(),
        });
    }
    catch (error) {
        logger_1.logger.error('Database health check error:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database health check failed',
        });
    }
});
router.get('/cache', async (req, res) => {
    try {
        const isHealthy = await cache_1.cacheService.healthCheck();
        res.json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.logger.error('Cache health check error:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Cache health check failed',
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.js.map