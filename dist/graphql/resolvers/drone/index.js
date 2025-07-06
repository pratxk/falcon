"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.droneResolvers = void 0;
const graphql_1 = require("graphql");
const rbac_1 = require("../../../utils/rbac");
const logger_1 = require("../../../utils/logger");
const cache_1 = require("../../../utils/cache");
const validation_1 = require("../../../utils/validation");
exports.droneResolvers = {
    Query: {
        drones: async (_parent, { organizationId }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireOrganizationAccess)(context, organizationId);
            const cacheKey = cache_1.cacheKeys.drones(organizationId);
            const cached = await cache_1.cacheService.get(cacheKey);
            if (cached) {
                logger_1.logger.debug(`Cache hit for drones: ${organizationId}`);
                return cached;
            }
            const drones = await context.prisma.drone.findMany({
                where: {
                    organizationId,
                    isActive: true,
                },
                include: {
                    organization: true,
                    missions: {
                        where: {
                            status: 'IN_PROGRESS',
                        },
                        take: 1,
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            await cache_1.cacheService.set(cacheKey, drones, { ttl: 300 });
            logger_1.logger.debug(`Cached drones for organization: ${organizationId}`);
            return drones;
        },
        drone: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            const cacheKey = cache_1.cacheKeys.drone(id);
            const cached = await cache_1.cacheService.get(cacheKey);
            if (cached) {
                logger_1.logger.debug(`Cache hit for drone: ${id}`);
                return cached;
            }
            const drone = await context.prisma.drone.findUnique({
                where: { id },
                include: {
                    organization: true,
                    missions: {
                        include: {
                            site: true,
                            createdBy: true,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                    flightLogs: {
                        orderBy: {
                            timestamp: 'desc',
                        },
                        take: 100,
                    },
                },
            });
            if (!drone) {
                throw new graphql_1.GraphQLError('Drone not found');
            }
            (0, rbac_1.requireOrganizationAccess)(context, drone.organizationId);
            await cache_1.cacheService.set(cacheKey, drone, { ttl: 600 });
            logger_1.logger.debug(`Cached drone: ${id}`);
            return drone;
        },
        availableDrones: async (_parent, { organizationId }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireOrganizationAccess)(context, organizationId);
            const cacheKey = cache_1.cacheKeys.availableDrones(organizationId);
            const cached = await cache_1.cacheService.get(cacheKey);
            if (cached) {
                logger_1.logger.debug(`Cache hit for availableDrones: ${organizationId}`);
                return cached;
            }
            const drones = await context.prisma.drone.findMany({
                where: {
                    organizationId,
                    isActive: true,
                    status: 'AVAILABLE',
                    batteryLevel: {
                        gte: 20,
                    },
                },
                include: {
                    organization: true,
                },
                orderBy: {
                    batteryLevel: 'desc',
                },
            });
            await cache_1.cacheService.set(cacheKey, drones, { ttl: 120 });
            logger_1.logger.debug(`Cached availableDrones for organization: ${organizationId}`);
            return drones;
        },
    },
    Mutation: {
        createDrone: async (_parent, { input }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            (0, rbac_1.requireOrganizationAccess)(context, input.organizationId);
            try {
                const validation = (0, validation_1.validateDroneInput)(input);
                if (!validation.isValid) {
                    throw new graphql_1.GraphQLError(`Invalid drone input: ${validation.errors.join(', ')}`);
                }
                const drone = await context.prisma.drone.create({
                    data: {
                        name: input.name,
                        model: input.model,
                        serialNumber: input.serialNumber,
                        organizationId: input.organizationId,
                        status: 'AVAILABLE',
                        batteryLevel: 100,
                        maxFlightTime: input.maxFlightTime,
                        maxSpeed: input.maxSpeed,
                        maxAltitude: input.maxAltitude,
                        cameraResolution: input.cameraResolution,
                        sensorTypes: input.sensorTypes || [],
                        isActive: true,
                    },
                    include: {
                        organization: true,
                    },
                });
                await cache_1.cacheInvalidation.drones(input.organizationId);
                logger_1.logger.info(`Drone created: ${input.name} by ${context.user?.email}`);
                return drone;
            }
            catch (error) {
                logger_1.logger.error('Create drone error:', error);
                throw error;
            }
        },
        updateDrone: async (_parent, { id, input }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const existingDrone = await context.prisma.drone.findUnique({
                    where: { id },
                });
                if (!existingDrone) {
                    throw new graphql_1.GraphQLError('Drone not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, existingDrone.organizationId);
                if (input) {
                    const validation = (0, validation_1.validateDroneInput)({ ...existingDrone, ...input });
                    if (!validation.isValid) {
                        throw new graphql_1.GraphQLError(`Invalid drone input: ${validation.errors.join(', ')}`);
                    }
                }
                const updateData = {};
                if (input.name)
                    updateData.name = input.name;
                if (input.model)
                    updateData.model = input.model;
                if (input.maxFlightTime !== undefined)
                    updateData.maxFlightTime = input.maxFlightTime;
                if (input.maxSpeed !== undefined)
                    updateData.maxSpeed = input.maxSpeed;
                if (input.maxAltitude !== undefined)
                    updateData.maxAltitude = input.maxAltitude;
                if (input.cameraResolution !== undefined)
                    updateData.cameraResolution = input.cameraResolution;
                if (input.sensorTypes !== undefined)
                    updateData.sensorTypes = input.sensorTypes;
                const drone = await context.prisma.drone.update({
                    where: { id },
                    data: updateData,
                    include: {
                        organization: true,
                    },
                });
                await cache_1.cacheInvalidation.drone(id, existingDrone.organizationId);
                logger_1.logger.info(`Drone updated: ${id} by ${context.user?.email}`);
                return drone;
            }
            catch (error) {
                logger_1.logger.error('Update drone error:', error);
                throw error;
            }
        },
        deleteDrone: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR']);
            try {
                const existingDrone = await context.prisma.drone.findUnique({
                    where: { id },
                    include: {
                        missions: true,
                    },
                });
                if (!existingDrone) {
                    throw new graphql_1.GraphQLError('Drone not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, existingDrone.organizationId);
                const activeMissions = existingDrone.missions.filter((mission) => mission.status === 'IN_PROGRESS' || mission.status === 'PLANNED');
                if (activeMissions.length > 0) {
                    throw new graphql_1.GraphQLError('Cannot delete drone with active missions');
                }
                await context.prisma.drone.update({
                    where: { id },
                    data: { isActive: false },
                });
                logger_1.logger.info(`Drone deleted: ${id} by ${context.user?.email}`);
                return true;
            }
            catch (error) {
                logger_1.logger.error('Delete drone error:', error);
                throw error;
            }
        },
        updateDroneStatus: async (_parent, { id, status }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const existingDrone = await context.prisma.drone.findUnique({
                    where: { id },
                });
                if (!existingDrone) {
                    throw new graphql_1.GraphQLError('Drone not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, existingDrone.organizationId);
                const drone = await context.prisma.drone.update({
                    where: { id },
                    data: { status },
                    include: {
                        organization: true,
                    },
                });
                logger_1.logger.info(`Drone status updated: ${id} to ${status} by ${context.user?.email}`);
                return drone;
            }
            catch (error) {
                logger_1.logger.error('Update drone status error:', error);
                throw error;
            }
        },
        updateDroneLocation: async (_parent, { id, latitude, longitude, altitude }, context) => {
            (0, rbac_1.requireAuth)(context);
            try {
                const existingDrone = await context.prisma.drone.findUnique({
                    where: { id },
                });
                if (!existingDrone) {
                    throw new graphql_1.GraphQLError('Drone not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, existingDrone.organizationId);
                if (!(0, validation_1.validateLatitude)(latitude)) {
                    throw new graphql_1.GraphQLError('Invalid latitude value');
                }
                if (!(0, validation_1.validateLongitude)(longitude)) {
                    throw new graphql_1.GraphQLError('Invalid longitude value');
                }
                if (!(0, validation_1.validateAltitude)(altitude)) {
                    throw new graphql_1.GraphQLError('Altitude cannot be negative');
                }
                const drone = await context.prisma.drone.update({
                    where: { id },
                    data: {
                        currentLatitude: latitude,
                        currentLongitude: longitude,
                        currentAltitude: altitude,
                    },
                    include: {
                        organization: true,
                    },
                });
                logger_1.logger.info(`Drone location updated: ${id} by ${context.user?.email}`);
                return drone;
            }
            catch (error) {
                logger_1.logger.error('Update drone location error:', error);
                throw error;
            }
        },
        updateDroneBattery: async (_parent, { id, batteryLevel }, context) => {
            (0, rbac_1.requireAuth)(context);
            try {
                const existingDrone = await context.prisma.drone.findUnique({
                    where: { id },
                });
                if (!existingDrone) {
                    throw new graphql_1.GraphQLError('Drone not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, existingDrone.organizationId);
                if (!(0, validation_1.validateBatteryLevel)(batteryLevel)) {
                    throw new graphql_1.GraphQLError('Battery level must be between 0 and 100');
                }
                const drone = await context.prisma.drone.update({
                    where: { id },
                    data: { batteryLevel },
                    include: {
                        organization: true,
                    },
                });
                logger_1.logger.info(`Drone battery updated: ${id} to ${batteryLevel}% by ${context.user?.email}`);
                return drone;
            }
            catch (error) {
                logger_1.logger.error('Update drone battery error:', error);
                throw error;
            }
        },
    },
    Drone: {
        organization: async (parent, _args, context) => {
            return await context.prisma.organization.findUnique({
                where: { id: parent.organizationId },
            });
        },
        missions: async (parent, _args, context) => {
            return await context.prisma.mission.findMany({
                where: {
                    droneId: parent.id,
                },
                include: {
                    site: true,
                    createdBy: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        },
        flightLogs: async (parent, _args, context) => {
            return await context.prisma.flightLog.findMany({
                where: {
                    droneId: parent.id,
                },
                orderBy: {
                    timestamp: 'desc',
                },
            });
        },
    },
};
//# sourceMappingURL=index.js.map