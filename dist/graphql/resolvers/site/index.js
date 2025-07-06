"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteResolvers = void 0;
const graphql_1 = require("graphql");
const rbac_1 = require("../../../utils/rbac");
const logger_1 = require("../../../utils/logger");
const validation_1 = require("../../../utils/validation");
exports.siteResolvers = {
    Query: {
        sites: async (_parent, { organizationId }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireOrganizationAccess)(context, organizationId);
            return await context.prisma.site.findMany({
                where: {
                    organizationId,
                    isActive: true,
                },
                include: {
                    organization: true,
                    missions: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 5,
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        },
        site: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            const site = await context.prisma.site.findUnique({
                where: { id },
                include: {
                    organization: true,
                    missions: {
                        include: {
                            drone: true,
                            createdBy: true,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                },
            });
            if (!site) {
                throw new graphql_1.GraphQLError('Site not found');
            }
            (0, rbac_1.requireOrganizationAccess)(context, site.organizationId);
            return site;
        },
    },
    Mutation: {
        createSite: async (_parent, { input }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            (0, rbac_1.requireOrganizationAccess)(context, input.organizationId);
            try {
                if (!(0, validation_1.validateLatitude)(input.latitude)) {
                    throw new graphql_1.GraphQLError('Invalid latitude value');
                }
                if (!(0, validation_1.validateLongitude)(input.longitude)) {
                    throw new graphql_1.GraphQLError('Invalid longitude value');
                }
                const site = await context.prisma.site.create({
                    data: {
                        name: input.name,
                        description: input.description,
                        latitude: input.latitude,
                        longitude: input.longitude,
                        altitude: input.altitude || 0,
                        organizationId: input.organizationId,
                        isActive: true,
                    },
                    include: {
                        organization: true,
                    },
                });
                logger_1.logger.info(`Site created: ${input.name} by ${context.user?.email}`);
                return site;
            }
            catch (error) {
                logger_1.logger.error('Create site error:', error);
                throw error;
            }
        },
        updateSite: async (_parent, { id, input }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
            try {
                const existingSite = await context.prisma.site.findUnique({
                    where: { id },
                });
                if (!existingSite) {
                    throw new graphql_1.GraphQLError('Site not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, existingSite.organizationId);
                if (input.latitude !== undefined && (input.latitude < -90 || input.latitude > 90)) {
                    throw new graphql_1.GraphQLError('Invalid latitude value');
                }
                if (input.longitude !== undefined && (input.longitude < -180 || input.longitude > 180)) {
                    throw new graphql_1.GraphQLError('Invalid longitude value');
                }
                const updateData = {};
                if (input.name)
                    updateData.name = input.name;
                if (input.description !== undefined)
                    updateData.description = input.description;
                if (input.latitude !== undefined)
                    updateData.latitude = input.latitude;
                if (input.longitude !== undefined)
                    updateData.longitude = input.longitude;
                if (input.altitude !== undefined)
                    updateData.altitude = input.altitude;
                const site = await context.prisma.site.update({
                    where: { id },
                    data: updateData,
                    include: {
                        organization: true,
                    },
                });
                logger_1.logger.info(`Site updated: ${id} by ${context.user?.email}`);
                return site;
            }
            catch (error) {
                logger_1.logger.error('Update site error:', error);
                throw error;
            }
        },
        deleteSite: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR']);
            try {
                const existingSite = await context.prisma.site.findUnique({
                    where: { id },
                    include: {
                        missions: true,
                    },
                });
                if (!existingSite) {
                    throw new graphql_1.GraphQLError('Site not found');
                }
                (0, rbac_1.requireOrganizationAccess)(context, existingSite.organizationId);
                const activeMissions = existingSite.missions.filter((mission) => mission.status === 'IN_PROGRESS' || mission.status === 'PLANNED');
                if (activeMissions.length > 0) {
                    throw new graphql_1.GraphQLError('Cannot delete site with active missions');
                }
                await context.prisma.site.update({
                    where: { id },
                    data: { isActive: false },
                });
                logger_1.logger.info(`Site deleted: ${id} by ${context.user?.email}`);
                return true;
            }
            catch (error) {
                logger_1.logger.error('Delete site error:', error);
                throw error;
            }
        },
    },
    Site: {
        organization: async (parent, _args, context) => {
            return await context.prisma.organization.findUnique({
                where: { id: parent.organizationId },
            });
        },
        missions: async (parent, _args, context) => {
            return await context.prisma.mission.findMany({
                where: {
                    siteId: parent.id,
                },
                include: {
                    drone: true,
                    createdBy: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        },
    },
};
//# sourceMappingURL=index.js.map