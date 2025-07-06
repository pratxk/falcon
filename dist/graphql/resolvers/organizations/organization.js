"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationResolvers = void 0;
const graphql_1 = require("graphql");
const rbac_1 = require("../../../utils/rbac");
const logger_1 = require("../../../utils/logger");
exports.organizationResolvers = {
    Query: {
        organizations: async (_parent, _args, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN']);
            return await context.prisma.organization.findMany({
                include: {
                    members: {
                        include: {
                            user: true,
                        },
                    },
                    _count: {
                        select: {
                            sites: true,
                            drones: true,
                            missions: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        },
        organization: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireOrganizationAccess)(context, id);
            const organization = await context.prisma.organization.findUnique({
                where: { id },
                include: {
                    members: {
                        include: {
                            user: true,
                        },
                    },
                    sites: true,
                    drones: true,
                    missions: {
                        take: 10,
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                },
            });
            if (!organization) {
                throw new graphql_1.GraphQLError('Organization not found');
            }
            return organization;
        },
        myOrganizations: async (_parent, _args, context) => {
            (0, rbac_1.requireAuth)(context);
            if (context.user?.role === 'SUPER_ADMIN') {
                return await context.prisma.organization.findMany({
                    include: {
                        members: {
                            include: {
                                user: true,
                            },
                        },
                        _count: {
                            select: {
                                sites: true,
                                drones: true,
                                missions: true,
                            },
                        },
                    },
                });
            }
            return await context.prisma.organization.findMany({
                where: {
                    members: {
                        some: {
                            userId: context.user?.id,
                        },
                    },
                },
                include: {
                    members: {
                        include: {
                            user: true,
                        },
                    },
                    _count: {
                        select: {
                            sites: true,
                            drones: true,
                            missions: true,
                        },
                    },
                },
            });
        },
    },
    Mutation: {
        createOrganization: async (_parent, { input }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN']);
            try {
                const organization = await context.prisma.organization.create({
                    data: {
                        name: input.name,
                        description: input.description,
                        members: {
                            create: {
                                userId: context.user?.id,
                                role: 'SUPER_ADMIN',
                            },
                        },
                    },
                    include: {
                        members: {
                            include: {
                                user: true,
                            },
                        },
                    },
                });
                logger_1.logger.info(`Organization created: ${input.name} by ${context.user?.email}`);
                return organization;
            }
            catch (error) {
                logger_1.logger.error('Create organization error:', error);
                throw error;
            }
        },
        updateOrganization: async (_parent, { id, input }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireOrganizationAccess)(context, id);
            try {
                const organization = await context.prisma.organization.update({
                    where: { id },
                    data: {
                        name: input.name,
                        description: input.description,
                    },
                    include: {
                        members: {
                            include: {
                                user: true,
                            },
                        },
                    },
                });
                logger_1.logger.info(`Organization updated: ${id} by ${context.user?.email}`);
                return organization;
            }
            catch (error) {
                logger_1.logger.error('Update organization error:', error);
                throw error;
            }
        },
        deleteOrganization: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN']);
            try {
                const activeMissions = await context.prisma.mission.count({
                    where: {
                        organizationId: id,
                        status: {
                            in: ['PLANNED', 'IN_PROGRESS'],
                        },
                    },
                });
                if (activeMissions > 0) {
                    throw new graphql_1.GraphQLError('Cannot delete organization with active missions');
                }
                await context.prisma.organization.update({
                    where: { id },
                    data: { isActive: false },
                });
                logger_1.logger.info(`Organization deleted: ${id} by ${context.user?.email}`);
                return true;
            }
            catch (error) {
                logger_1.logger.error('Delete organization error:', error);
                throw error;
            }
        },
        addUserToOrganization: async (_parent, { userId, organizationId, role }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireOrganizationAccess)(context, organizationId);
            try {
                const user = await context.prisma.user.findUnique({
                    where: { id: userId },
                });
                if (!user) {
                    throw new graphql_1.GraphQLError('User not found');
                }
                const existingMembership = await context.prisma.organizationMember.findUnique({
                    where: {
                        userId_organizationId: {
                            userId,
                            organizationId,
                        },
                    },
                });
                if (existingMembership) {
                    throw new graphql_1.GraphQLError('User is already a member of this organization');
                }
                const membership = await context.prisma.organizationMember.create({
                    data: {
                        userId,
                        organizationId,
                        role: role,
                    },
                    include: {
                        user: true,
                        organization: true,
                    },
                });
                logger_1.logger.info(`User added to organization: ${userId} to ${organizationId} by ${context.user?.email}`);
                return membership;
            }
            catch (error) {
                logger_1.logger.error('Add user to organization error:', error);
                throw error;
            }
        },
        removeUserFromOrganization: async (_parent, { userId, organizationId }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireOrganizationAccess)(context, organizationId);
            try {
                if (userId === context.user?.id) {
                    const superAdminCount = await context.prisma.organizationMember.count({
                        where: {
                            organizationId,
                            role: 'SUPER_ADMIN',
                        },
                    });
                    if (superAdminCount === 1) {
                        throw new graphql_1.GraphQLError('Cannot remove the only super admin from organization');
                    }
                }
                await context.prisma.organizationMember.delete({
                    where: {
                        userId_organizationId: {
                            userId,
                            organizationId,
                        },
                    },
                });
                logger_1.logger.info(`User removed from organization: ${userId} from ${organizationId} by ${context.user?.email}`);
                return true;
            }
            catch (error) {
                logger_1.logger.error('Remove user from organization error:', error);
                throw error;
            }
        },
        updateOrganizationMemberRole: async (_parent, { userId, organizationId, role }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireOrganizationAccess)(context, organizationId);
            try {
                const membership = await context.prisma.organizationMember.update({
                    where: {
                        userId_organizationId: {
                            userId,
                            organizationId,
                        },
                    },
                    data: { role: role },
                    include: {
                        user: true,
                        organization: true,
                    },
                });
                logger_1.logger.info(`User role updated in organization: ${userId} in ${organizationId} by ${context.user?.email}`);
                return membership;
            }
            catch (error) {
                logger_1.logger.error('Update organization member role error:', error);
                throw error;
            }
        },
    },
    Organization: {
        members: async (parent, _args, context) => {
            return await context.prisma.organizationMember.findMany({
                where: { organizationId: parent.id },
                include: {
                    user: true,
                },
            });
        },
        sites: async (parent, _args, context) => {
            return await context.prisma.site.findMany({
                where: { organizationId: parent.id, isActive: true },
            });
        },
        drones: async (parent, _args, context) => {
            return await context.prisma.drone.findMany({
                where: { organizationId: parent.id, isActive: true },
            });
        },
        missions: async (parent, _args, context) => {
            return await context.prisma.mission.findMany({
                where: { organizationId: parent.id },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
        },
        stats: async (parent, _args, context) => {
            const [totalDrones, activeDrones, totalMissions, completedMissions, totalSites, flightLogsAggregate,] = await Promise.all([
                context.prisma.drone.count({
                    where: { organizationId: parent.id, isActive: true },
                }),
                context.prisma.drone.count({
                    where: { organizationId: parent.id, isActive: true, status: 'AVAILABLE' },
                }),
                context.prisma.mission.count({
                    where: { organizationId: parent.id },
                }),
                context.prisma.mission.count({
                    where: { organizationId: parent.id, status: 'COMPLETED' },
                }),
                context.prisma.site.count({
                    where: { organizationId: parent.id, isActive: true },
                }),
                context.prisma.mission.aggregate({
                    where: {
                        organizationId: parent.id,
                        status: 'COMPLETED',
                        startedAt: { not: null },
                        completedAt: { not: null },
                    },
                    _avg: {
                        estimatedDuration: true,
                    },
                }),
            ]);
            return {
                totalDrones,
                activeDrones,
                totalMissions,
                completedMissions,
                totalSites,
                totalFlightHours: 0,
                averageMissionDuration: flightLogsAggregate._avg.estimatedDuration || 0,
            };
        },
    },
};
//# sourceMappingURL=organization.js.map