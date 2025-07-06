"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const typeDefs_1 = require("./graphql/typeDefs");
const resolvers_1 = require("./graphql/resolvers");
const auth_1 = require("./middleware/auth");
const logger_1 = require("./utils/logger");
const redis_service_1 = require("./utils/redis-service");
const database_1 = require("./utils/database");
const cache_1 = __importDefault(require("./routes/cache"));
const health_1 = __importDefault(require("./routes/health"));
const server_2 = require("./websocket/server");
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
async function startServer() {
    try {
        const prisma = await database_1.databaseService.connect();
        await redis_service_1.redisService.connect();
        const app = (0, express_1.default)();
        const httpServer = (0, http_1.createServer)(app);
        const server = new server_1.ApolloServer({
            typeDefs: typeDefs_1.typeDefs,
            resolvers: resolvers_1.resolvers,
            introspection: process.env.NODE_ENV !== 'production',
            includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
        });
        await server.start();
        app.use('/graphql', (0, cors_1.default)({
            origin: [
                process.env.CORS_ORIGIN || 'http://localhost:3000',
                'https://studio.apollographql.com',
                'https://studio.apollographql.com/sandbox',
                'http://localhost:4000'
            ],
            credentials: true,
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }), express_1.default.json(), auth_1.authMiddleware, (0, express4_1.expressMiddleware)(server, {
            context: async ({ req }) => ({
                prisma,
                user: req.user,
                redis: await redis_service_1.redisService.getClient(),
            }),
        }));
        app.get('/', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });
        app.use('/api/health', health_1.default);
        app.use('/api/cache', cache_1.default);
        httpServer.listen(PORT, () => {
            logger_1.logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
            logger_1.logger.info(`📊 GraphQL Playground available in development mode`);
        });
        (0, server_2.setupWebSocketServer)(httpServer);
        process.on('SIGTERM', async () => {
            logger_1.logger.info('SIGTERM received, shutting down gracefully');
            await database_1.databaseService.disconnect();
            await redis_service_1.redisService.disconnect();
            process.exit(0);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map