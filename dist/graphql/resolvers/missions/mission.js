"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionResolvers = void 0;
const graphql_1 = require("graphql");
const rbac_1 = require("../../../utils/rbac");
const logger_1 = require("../../../utils/logger");
const cache_1 = require("../../../utils/cache");
exports.missionResolvers = {
    Query: {
        missions: async (_parent, { organizationId, status }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireOrganizationAccess)(context, organizationId);
            const cacheKey = cache_1.cacheKeys.missions(organizationId, status);
            const cached = await cache_1.cacheService.get(cacheKey);
            if (cached) {
                logger_1.logger.debug(`Cache hit for missions: ${organizationId}`);
                return cached;
            }
            const whereClause = {
                organizationId,
                isActive: true,
            };
            if (status) {
                whereClause.status = status;
            }
            const missions = await context.prisma.mission.findMany({
                where: whereClause,
                include: {
                    drone: true,
                    site: true,
                    createdBy: true,
                    assignedTo: true,
                    waypoints: {
                        orderBy: {
                            sequence: 'asc',
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            await cache_1.cacheService.set(cacheKey, missions, { ttl: 300 });
            logger_1.logger.debug(`Cached missions for organization: ${organizationId}`);
            return missions;
        },
        mission: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            const cacheKey = cache_1.cacheKeys.mission(id);
            const cached = await cache_1.cacheService.get(cacheKey);
            if (cached) {
                logger_1.logger.debug(`Cache hit for mission: ${id}`);
                return cached;
            }
            const mission = await context.prisma.mission.findUnique({
                where: { id },
                include: {
                    drone: true,
                    site: true,
                    createdBy: true,
                    assignedTo: true,
                    organization: true,
                    waypoints: {
                        orderBy: {
                            sequence: 'asc',
                        },
                    },
                    flightLogs: {
                        orderBy: {
                            timestamp: 'desc',
                        },
                        take: 100,
                    },
                    surveyData: {
                        orderBy: {
                            capturedAt: 'desc',
                        },
                    },
                },
            });
            if (!mission) {
                throw new graphql_1.GraphQLError('Mission not found');
            }
            (0, rbac_1.requireOrganizationAccess)(context, mission.organizationId);
            await cache_1.cacheService.set(cacheKey, mission, { ttl: 600 });
            logger_1.logger.debug(`Cached mission: ${id}`);
            return mission;
        },
        myMissions: async (_parent, _args, context) => {
            (0, rbac_1.requireAuth)(context);
            const cacheKey = cache_1.cacheKeys.myMissions(context.user?.id || '');
            const cached = await cache_1.cacheService.get(cacheKey);
            if (cached) {
                logger_1.logger.debug(`Cache hit for myMissions: ${context.user?.id}`);
                return cached;
            }
            const missions = await context.prisma.mission.findMany({
                where: {
                    OR: [
                        { createdById: context.user?.id },
                        { assignedToId: context.user?.id },
                    ],
                    isActive: true,
                },
                include: {
                    drone: true,
                    site: true,
                    createdBy: true,
                    assignedTo: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            await cache_1.cacheService.set(cacheKey, missions, { ttl: 300 });
            logger_1.logger.debug(`Cached myMissions for user: ${context.user?.id || 'unknown'}`);
            return missions;
        },
        activeMissions: async (_parent, { organizationId }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireOrganizationAccess)(context, organizationId);
            const cacheKey = cache_1.cacheKeys.activeMissions(organizationId);
            const cached = await cache_1.cacheService.get(cacheKey);
            if (cached) {
                logger_1.logger.debug(`Cache hit for activeMissions: ${organizationId}`);
                return cached;
            }
            const missions = await context.prisma.mission.findMany({
                where: {
                    organizationId,
                    status: 'IN_PROGRESS',
                    isActive: true,
                },
                include: {
                    drone: true,
                    site: true,
                    createdBy: true,
                    assignedTo: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            await cache_1.cacheService.set(cacheKey, missions, { ttl: 120 });
            logger_1.logger.debug(`Cached activeMissions for organization: ${organizationId}`);
            return missions;
        },
    },
    Mutation: {
        createMission: async (_parent, { input }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            (0, rbac_1.requireOrganizationAccess)(context, input.organizationId);
            try {
                if (input.plannedAltitude <= 0) {
                    throw new graphql_1.GraphQLError('Planned altitude must be positive');
                }
                if (input.plannedSpeed <= 0) {
                    throw new graphql_1.GraphQLError('Planned speed must be positive');
                }
                if (input.overlapPercentage < 0 || input.overlapPercentage > 100) {
                    throw new graphql_1.GraphQLError('Overlap percentage must be between 0 and 100');
                }
                const drone = await context.prisma.drone.findUnique({
                    where: { id: input.droneId },
                });
                if (!drone) {
                    throw new graphql_1.GraphQLError('Drone not found');
                }
                if (drone.status !== 'AVAILABLE') {
                    throw new graphql_1.GraphQLError('Selected drone is not available');
                }
                const site = await context.prisma.site.findUnique({
                    where: { id: input.siteId },
                });
                if (!site) {
                    throw new graphql_1.GraphQLError('Site not found');
                }
                const missionData = {
                    name: input.name,
                    description: input.description,
                    type: input.type,
                    status: 'PLANNED',
                    priority: input.priority || 1,
                    flightPattern: input.flightPattern,
                    plannedAltitude: input.plannedAltitude,
                    plannedSpeed: input.plannedSpeed,
                    overlapPercentage: input.overlapPercentage || 70,
                    scheduledAt: input.scheduledAt,
                    estimatedDuration: input.estimatedDuration,
                    droneId: input.droneId,
                    siteId: input.siteId,
                    organizationId: input.organizationId,
                    createdById: context.user?.id,
                    isActive: true,
                };
                const mission = await context.prisma.mission.create({
                    data: missionData,
                    include: {
                        drone: true,
                        site: true,
                        createdBy: true,
                        organization: true,
                    },
                });
                if (input.waypoints && input.waypoints.length > 0) {
                    const waypointData = input.waypoints.map((wp, index) => ({
                        missionId: mission.id,
                        sequence: index + 1,
                        latitude: wp.latitude,
                        longitude: wp.longitude,
                        altitude: wp.altitude,
                        action: wp.action,
                        parameters: wp.parameters || {},
                    }));
                    await context.prisma.waypoint.createMany({
                        data: waypointData,
                    });
                }
                await cache_1.cacheInvalidation.missions(input.organizationId);
                await cache_1.cacheInvalidation.drones(input.organizationId);
                logger_1.logger.info(`Mission created: ${input.name} by ${context.user?.email}`);
                return mission;
            }
            catch (error) {
                logger_1.logger.error('Create mission error:', error);
                throw error;
            }
        },
        updateMission: async (_parent, { id, input }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const existingMission = await context.prisma.mission.findUnique({
                    where: { id },
                });
                if (!existingMission) {
                    throw new graphql_1.GraphQLError('Mission not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, existingMission.organizationId);
                if (existingMission.status === 'IN_PROGRESS' || existingMission.status === 'COMPLETED') {
                    throw new graphql_1.GraphQLError('Cannot update active or completed missions');
                }
                if (input.plannedAltitude !== undefined && input.plannedAltitude <= 0) {
                    throw new graphql_1.GraphQLError('Planned altitude must be positive');
                }
                if (input.plannedSpeed !== undefined && input.plannedSpeed <= 0) {
                    throw new graphql_1.GraphQLError('Planned speed must be positive');
                }
                if (input.overlapPercentage !== undefined && (input.overlapPercentage < 0 || input.overlapPercentage > 100)) {
                    throw new graphql_1.GraphQLError('Overlap percentage must be between 0 and 100');
                }
                const updateData = {};
                if (input.name)
                    updateData.name = input.name;
                if (input.description !== undefined)
                    updateData.description = input.description;
                if (input.type)
                    updateData.type = input.type;
                if (input.priority !== undefined)
                    updateData.priority = input.priority;
                if (input.flightPattern)
                    updateData.flightPattern = input.flightPattern;
                if (input.plannedAltitude !== undefined)
                    updateData.plannedAltitude = input.plannedAltitude;
                if (input.plannedSpeed !== undefined)
                    updateData.plannedSpeed = input.plannedSpeed;
                if (input.overlapPercentage !== undefined)
                    updateData.overlapPercentage = input.overlapPercentage;
                if (input.scheduledAt !== undefined)
                    updateData.scheduledAt = input.scheduledAt;
                if (input.estimatedDuration !== undefined)
                    updateData.estimatedDuration = input.estimatedDuration;
                if (input.droneId)
                    updateData.droneId = input.droneId;
                if (input.siteId)
                    updateData.siteId = input.siteId;
                const mission = await context.prisma.mission.update({
                    where: { id },
                    data: updateData,
                    include: {
                        drone: true,
                        site: true,
                        createdBy: true,
                        organization: true,
                    },
                });
                await cache_1.cacheInvalidation.mission(id, existingMission.organizationId);
                logger_1.logger.info(`Mission updated: ${id} by ${context.user?.email}`);
                return mission;
            }
            catch (error) {
                logger_1.logger.error('Update mission error:', error);
                throw error;
            }
        },
        deleteMission: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR']);
            try {
                const existingMission = await context.prisma.mission.findUnique({
                    where: { id },
                });
                if (!existingMission) {
                    throw new graphql_1.GraphQLError('Mission not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, existingMission.organizationId);
                if (existingMission.status === 'IN_PROGRESS') {
                    throw new graphql_1.GraphQLError('Cannot delete mission in progress');
                }
                await context.prisma.mission.update({
                    where: { id },
                    data: { isActive: false },
                });
                await cache_1.cacheInvalidation.mission(id, existingMission.organizationId);
                logger_1.logger.info(`Mission deleted: ${id} by ${context.user?.email}`);
                return true;
            }
            catch (error) {
                logger_1.logger.error('Delete mission error:', error);
                throw error;
            }
        },
        startMission: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const mission = await context.prisma.mission.findUnique({
                    where: { id },
                    include: {
                        drone: true,
                    },
                });
                if (!mission) {
                    throw new graphql_1.GraphQLError('Mission not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, mission.organizationId);
                if (mission.status !== 'PLANNED') {
                    throw new graphql_1.GraphQLError('Only planned missions can be started');
                }
                if (mission.drone.status !== 'AVAILABLE') {
                    throw new graphql_1.GraphQLError('Drone is not available');
                }
                const [updatedMission] = await context.prisma.$transaction([
                    context.prisma.mission.update({
                        where: { id },
                        data: {
                            status: 'IN_PROGRESS',
                            startedAt: new Date(),
                        },
                        include: {
                            drone: true,
                            site: true,
                            createdBy: true,
                            organization: true,
                        },
                    }),
                    context.prisma.drone.update({
                        where: { id: mission.droneId },
                        data: { status: 'IN_MISSION' },
                    }),
                ]);
                logger_1.logger.info(`Mission started: ${id} by ${context.user?.email}`);
                return updatedMission;
            }
            catch (error) {
                logger_1.logger.error('Start mission error:', error);
                throw error;
            }
        },
        pauseMission: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const mission = await context.prisma.mission.findUnique({
                    where: { id },
                });
                if (!mission) {
                    throw new graphql_1.GraphQLError('Mission not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, mission.organizationId);
                if (mission.status !== 'IN_PROGRESS') {
                    throw new graphql_1.GraphQLError('Only missions in progress can be paused');
                }
                const updatedMission = await context.prisma.mission.update({
                    where: { id },
                    data: { status: 'PLANNED' },
                    include: {
                        drone: true,
                        site: true,
                        createdBy: true,
                        organization: true,
                    },
                });
                logger_1.logger.info(`Mission paused: ${id} by ${context.user?.email}`);
                return updatedMission;
            }
            catch (error) {
                logger_1.logger.error('Pause mission error:', error);
                throw error;
            }
        },
        resumeMission: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const mission = await context.prisma.mission.findUnique({
                    where: { id },
                });
                if (!mission) {
                    throw new graphql_1.GraphQLError('Mission not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, mission.organizationId);
                if (mission.status !== 'PLANNED') {
                    throw new graphql_1.GraphQLError('Only paused missions can be resumed');
                }
                const updatedMission = await context.prisma.mission.update({
                    where: { id },
                    data: { status: 'IN_PROGRESS' },
                    include: {
                        drone: true,
                        site: true,
                        createdBy: true,
                        organization: true,
                    },
                });
                logger_1.logger.info(`Mission resumed: ${id} by ${context.user?.email}`);
                return updatedMission;
            }
            catch (error) {
                logger_1.logger.error('Resume mission error:', error);
                throw error;
            }
        },
        abortMission: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const mission = await context.prisma.mission.findUnique({
                    where: { id },
                    include: {
                        drone: true,
                    },
                });
                if (!mission) {
                    throw new graphql_1.GraphQLError('Mission not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, mission.organizationId);
                if (mission.status !== 'IN_PROGRESS' && mission.status !== 'PLANNED') {
                    throw new graphql_1.GraphQLError('Only active or planned missions can be aborted');
                }
                const [updatedMission] = await context.prisma.$transaction([
                    context.prisma.mission.update({
                        where: { id },
                        data: { status: 'ABORTED' },
                        include: {
                            drone: true,
                            site: true,
                            createdBy: true,
                            organization: true,
                        },
                    }),
                    context.prisma.drone.update({
                        where: { id: mission.droneId },
                        data: { status: 'AVAILABLE' },
                    }),
                ]);
                logger_1.logger.info(`Mission aborted: ${id} by ${context.user?.email}`);
                return updatedMission;
            }
            catch (error) {
                logger_1.logger.error('Abort mission error:', error);
                throw error;
            }
        },
        completeMission: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const mission = await context.prisma.mission.findUnique({
                    where: { id },
                    include: {
                        drone: true,
                    },
                });
                if (!mission) {
                    throw new graphql_1.GraphQLError('Mission not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, mission.organizationId);
                if (mission.status !== 'IN_PROGRESS') {
                    throw new graphql_1.GraphQLError('Only missions in progress can be completed');
                }
                const [updatedMission] = await context.prisma.$transaction([
                    context.prisma.mission.update({
                        where: { id },
                        data: {
                            status: 'COMPLETED',
                            completedAt: new Date(),
                        },
                        include: {
                            drone: true,
                            site: true,
                            createdBy: true,
                            organization: true,
                        },
                    }),
                    context.prisma.drone.update({
                        where: { id: mission.droneId },
                        data: { status: 'AVAILABLE' },
                    }),
                ]);
                logger_1.logger.info(`Mission completed: ${id} by ${context.user?.email}`);
                return updatedMission;
            }
            catch (error) {
                logger_1.logger.error('Complete mission error:', error);
                throw error;
            }
        },
        assignMission: async (_parent, { id, userId }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR']);
            try {
                const mission = await context.prisma.mission.findUnique({
                    where: { id },
                });
                if (!mission) {
                    throw new graphql_1.GraphQLError('Mission not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, mission.organizationId);
                const user = await context.prisma.user.findUnique({
                    where: { id: userId },
                    include: {
                        organizationMemberships: {
                            where: {
                                organizationId: mission.organizationId,
                            },
                        },
                    },
                });
                if (!user) {
                    throw new graphql_1.GraphQLError('User not found');
                }
                if (user.organizationMemberships.length === 0) {
                    throw new graphql_1.GraphQLError('User does not have access to this organization');
                }
                const updatedMission = await context.prisma.mission.update({
                    where: { id },
                    data: { assignedToId: userId },
                    include: {
                        drone: true,
                        site: true,
                        createdBy: true,
                        assignedTo: true,
                        organization: true,
                    },
                });
                logger_1.logger.info(`Mission assigned: ${id} to user ${userId} by ${context.user?.email}`);
                return updatedMission;
            }
            catch (error) {
                logger_1.logger.error('Assign mission error:', error);
                throw error;
            }
        },
    },
    Mission: {
        createdBy: async (parent, _args, context) => {
            return await context.prisma.user.findUnique({
                where: { id: parent.createdById },
            });
        },
        assignedTo: async (parent, _args, context) => {
            if (!parent.assignedToId)
                return null;
            return await context.prisma.user.findUnique({
                where: { id: parent.assignedToId },
            });
        },
        drone: async (parent, _args, context) => {
            return await context.prisma.drone.findUnique({
                where: { id: parent.droneId },
            });
        },
        site: async (parent, _args, context) => {
            return await context.prisma.site.findUnique({
                where: { id: parent.siteId },
            });
        },
        organization: async (parent, _args, context) => {
            return await context.prisma.organization.findUnique({
                where: { id: parent.organizationId },
            });
        },
        waypoints: async (parent, _args, context) => {
            return await context.prisma.waypoint.findMany({
                where: { missionId: parent.id },
                orderBy: { sequence: 'asc' },
            });
        },
        flightLogs: async (parent, _args, context) => {
            return await context.prisma.flightLog.findMany({
                where: { missionId: parent.id },
                orderBy: { timestamp: 'desc' },
            });
        },
        surveyData: async (parent, _args, context) => {
            return await context.prisma.surveyData.findMany({
                where: { missionId: parent.id },
                orderBy: { capturedAt: 'desc' },
            });
        },
        progress: async (parent, _args, context) => {
            if (parent.status === 'COMPLETED')
                return 100;
            if (parent.status === 'PLANNED')
                return 0;
            if (parent.status === 'ABORTED' || parent.status === 'FAILED')
                return 0;
            const waypoints = await context.prisma.waypoint.findMany({
                where: { missionId: parent.id },
                orderBy: { sequence: 'asc' },
            });
            if (waypoints.length === 0)
                return 0;
            if (parent.startedAt && parent.estimatedDuration) {
                const elapsed = Date.now() - new Date(parent.startedAt).getTime();
                const estimatedMs = parent.estimatedDuration * 60 * 1000;
                const progress = Math.min((elapsed / estimatedMs) * 100, 95);
                return Math.round(progress);
            }
            return 0;
        },
    },
};
//# sourceMappingURL=mission.js.map