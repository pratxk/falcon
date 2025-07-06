"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightLogResolvers = void 0;
const graphql_1 = require("graphql");
const rbac_1 = require("../../../utils/rbac");
const logger_1 = require("../../../utils/logger");
const validation_1 = require("../../../utils/validation");
exports.flightLogResolvers = {
    Query: {
        realtimeFlightData: async (_parent, { missionId }, context) => {
            (0, rbac_1.requireAuth)(context);
            const mission = await context.prisma.mission.findUnique({
                where: { id: missionId },
            });
            if (!mission) {
                throw new graphql_1.GraphQLError('Mission not found');
            }
            (0, rbac_1.requireOrganizationAccess)(context, mission.organizationId);
            return await context.prisma.flightLog.findMany({
                where: {
                    missionId,
                },
                orderBy: {
                    timestamp: 'desc',
                },
                take: 100,
            });
        },
    },
    Mutation: {
        logFlightData: async (_parent, { input }, context) => {
            (0, rbac_1.requireAuth)(context);
            try {
                const mission = await context.prisma.mission.findUnique({
                    where: { id: input.missionId },
                });
                if (!mission) {
                    throw new graphql_1.GraphQLError('Mission not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, mission.organizationId);
                if (!(0, validation_1.validateLatitude)(input.latitude)) {
                    throw new graphql_1.GraphQLError('Invalid latitude value');
                }
                if (!(0, validation_1.validateLongitude)(input.longitude)) {
                    throw new graphql_1.GraphQLError('Invalid longitude value');
                }
                if (!(0, validation_1.validateAltitude)(input.altitude)) {
                    throw new graphql_1.GraphQLError('Altitude cannot be negative');
                }
                if (!(0, validation_1.validateSpeed)(input.speed)) {
                    throw new graphql_1.GraphQLError('Speed cannot be negative');
                }
                if (!(0, validation_1.validateBatteryLevel)(input.batteryLevel)) {
                    throw new graphql_1.GraphQLError('Battery level must be between 0 and 100');
                }
                if (input.gpsAccuracy !== undefined && !(0, validation_1.validateGPSAccuracy)(input.gpsAccuracy)) {
                    throw new graphql_1.GraphQLError('GPS accuracy cannot be negative');
                }
                if (input.heading !== undefined && !(0, validation_1.validateHeading)(input.heading)) {
                    throw new graphql_1.GraphQLError('Heading must be between 0 and 360 degrees');
                }
                const flightLog = await context.prisma.flightLog.create({
                    data: {
                        missionId: input.missionId,
                        droneId: input.droneId,
                        timestamp: new Date(),
                        latitude: input.latitude,
                        longitude: input.longitude,
                        altitude: input.altitude,
                        speed: input.speed,
                        batteryLevel: input.batteryLevel,
                        gpsAccuracy: input.gpsAccuracy,
                        heading: input.heading,
                    },
                    include: {
                        mission: true,
                        drone: true,
                    },
                });
                await context.prisma.drone.update({
                    where: { id: input.droneId },
                    data: {
                        currentLatitude: input.latitude,
                        currentLongitude: input.longitude,
                        currentAltitude: input.altitude,
                        batteryLevel: input.batteryLevel,
                    },
                });
                logger_1.logger.info(`Flight data logged for mission ${input.missionId} by ${context.user?.email || 'unknown'}`);
                return flightLog;
            }
            catch (error) {
                logger_1.logger.error('Log flight data error:', error);
                throw error;
            }
        },
    },
    FlightLog: {
        mission: async (parent, _args, context) => {
            return await context.prisma.mission.findUnique({
                where: { id: parent.missionId },
            });
        },
        drone: async (parent, _args, context) => {
            return await context.prisma.drone.findUnique({
                where: { id: parent.droneId },
            });
        },
    },
};
//# sourceMappingURL=index.js.map