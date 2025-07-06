"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waypointResolvers = void 0;
const graphql_1 = require("graphql");
const rbac_1 = require("../../../utils/rbac");
const logger_1 = require("../../../utils/logger");
const validation_1 = require("../../../utils/validation");
exports.waypointResolvers = {
    Query: {},
    Mutation: {
        addWaypoint: async (_parent, { missionId, input }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const mission = await context.prisma.mission.findUnique({
                    where: { id: missionId },
                    include: {
                        waypoints: {
                            orderBy: {
                                sequence: 'asc',
                            },
                        },
                    },
                });
                if (!mission) {
                    throw new graphql_1.GraphQLError('Mission not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, mission.organizationId);
                if (mission.status === 'IN_PROGRESS' || mission.status === 'COMPLETED') {
                    throw new graphql_1.GraphQLError('Cannot modify waypoints for active or completed missions');
                }
                if (!(0, validation_1.validateLatitude)(input.latitude)) {
                    throw new graphql_1.GraphQLError('Invalid latitude value');
                }
                if (!(0, validation_1.validateLongitude)(input.longitude)) {
                    throw new graphql_1.GraphQLError('Invalid longitude value');
                }
                if (!(0, validation_1.validateAltitude)(input.altitude)) {
                    throw new graphql_1.GraphQLError('Altitude cannot be negative');
                }
                let sequence = input.sequence;
                if (!sequence) {
                    sequence = mission.waypoints.length + 1;
                }
                const existingWaypoint = mission.waypoints.find((wp) => wp.sequence === sequence);
                if (existingWaypoint) {
                    throw new graphql_1.GraphQLError(`Waypoint with sequence ${sequence} already exists`);
                }
                const waypoint = await context.prisma.waypoint.create({
                    data: {
                        missionId,
                        sequence,
                        latitude: input.latitude,
                        longitude: input.longitude,
                        altitude: input.altitude,
                        action: input.action,
                        parameters: input.parameters || {},
                    },
                    include: {
                        mission: true,
                    },
                });
                logger_1.logger.info(`Waypoint added to mission ${missionId} by ${context.user?.email || 'unknown'}`);
                return waypoint;
            }
            catch (error) {
                logger_1.logger.error('Add waypoint error:', error);
                throw error;
            }
        },
        updateWaypoint: async (_parent, { id, input }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const waypoint = await context.prisma.waypoint.findUnique({
                    where: { id },
                    include: {
                        mission: true,
                    },
                });
                if (!waypoint) {
                    throw new graphql_1.GraphQLError('Waypoint not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, waypoint.mission.organizationId);
                if (waypoint.mission.status === 'IN_PROGRESS' || waypoint.mission.status === 'COMPLETED') {
                    throw new graphql_1.GraphQLError('Cannot modify waypoints for active or completed missions');
                }
                if (input.latitude !== undefined && !(0, validation_1.validateLatitude)(input.latitude)) {
                    throw new graphql_1.GraphQLError('Invalid latitude value');
                }
                if (input.longitude !== undefined && !(0, validation_1.validateLongitude)(input.longitude)) {
                    throw new graphql_1.GraphQLError('Invalid longitude value');
                }
                if (input.altitude !== undefined && !(0, validation_1.validateAltitude)(input.altitude)) {
                    throw new graphql_1.GraphQLError('Altitude cannot be negative');
                }
                if (input.sequence !== undefined) {
                    const existingWaypoint = await context.prisma.waypoint.findFirst({
                        where: {
                            missionId: waypoint.missionId,
                            sequence: input.sequence,
                            id: { not: id },
                        },
                    });
                    if (existingWaypoint) {
                        throw new graphql_1.GraphQLError(`Waypoint with sequence ${input.sequence} already exists`);
                    }
                }
                const updateData = {};
                if (input.sequence !== undefined)
                    updateData.sequence = input.sequence;
                if (input.latitude !== undefined)
                    updateData.latitude = input.latitude;
                if (input.longitude !== undefined)
                    updateData.longitude = input.longitude;
                if (input.altitude !== undefined)
                    updateData.altitude = input.altitude;
                if (input.action !== undefined)
                    updateData.action = input.action;
                if (input.parameters !== undefined)
                    updateData.parameters = input.parameters;
                const updatedWaypoint = await context.prisma.waypoint.update({
                    where: { id },
                    data: updateData,
                    include: {
                        mission: true,
                    },
                });
                logger_1.logger.info(`Waypoint updated: ${id} by ${context.user?.email || 'unknown'}`);
                return updatedWaypoint;
            }
            catch (error) {
                logger_1.logger.error('Update waypoint error:', error);
                throw error;
            }
        },
        deleteWaypoint: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const waypoint = await context.prisma.waypoint.findUnique({
                    where: { id },
                    include: {
                        mission: true,
                    },
                });
                if (!waypoint) {
                    throw new graphql_1.GraphQLError('Waypoint not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, waypoint.mission.organizationId);
                if (waypoint.mission.status === 'IN_PROGRESS' || waypoint.mission.status === 'COMPLETED') {
                    throw new graphql_1.GraphQLError('Cannot delete waypoints for active or completed missions');
                }
                await context.prisma.waypoint.delete({
                    where: { id },
                });
                logger_1.logger.info(`Waypoint deleted: ${id} by ${context.user?.email || 'unknown'}`);
                return true;
            }
            catch (error) {
                logger_1.logger.error('Delete waypoint error:', error);
                throw error;
            }
        },
        reorderWaypoints: async (_parent, { missionId, waypointIds }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const mission = await context.prisma.mission.findUnique({
                    where: { id: missionId },
                    include: {
                        waypoints: true,
                    },
                });
                if (!mission) {
                    throw new graphql_1.GraphQLError('Mission not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, mission.organizationId);
                if (mission.status === 'IN_PROGRESS' || mission.status === 'COMPLETED') {
                    throw new graphql_1.GraphQLError('Cannot reorder waypoints for active or completed missions');
                }
                const missionWaypointIds = mission.waypoints.map((wp) => wp.id);
                const invalidWaypoints = waypointIds.filter(id => !missionWaypointIds.includes(id));
                if (invalidWaypoints.length > 0) {
                    throw new graphql_1.GraphQLError('Some waypoints do not belong to this mission');
                }
                const updates = waypointIds.map((waypointId, index) => ({
                    where: { id: waypointId },
                    data: { sequence: index + 1 },
                }));
                await context.prisma.$transaction(updates.map(update => context.prisma.waypoint.update(update)));
                const updatedWaypoints = await context.prisma.waypoint.findMany({
                    where: { missionId },
                    include: {
                        mission: true,
                    },
                    orderBy: {
                        sequence: 'asc',
                    },
                });
                logger_1.logger.info(`Waypoints reordered for mission ${missionId} by ${context.user?.email || 'unknown'}`);
                return updatedWaypoints;
            }
            catch (error) {
                logger_1.logger.error('Reorder waypoints error:', error);
                throw error;
            }
        },
    },
    Waypoint: {
        mission: async (parent, _args, context) => {
            return await context.prisma.mission.findUnique({
                where: { id: parent.missionId },
            });
        },
    },
};
//# sourceMappingURL=index.js.map