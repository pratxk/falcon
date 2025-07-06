"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const graphql_1 = require("graphql");
const rbac_1 = require("../../../utils/rbac");
const logger_1 = require("../../../utils/logger");
const validation_1 = require("../../../utils/validation");
exports.userResolvers = {
    Query: {
        users: async (_parent, { organizationId }, context) => {
            (0, rbac_1.requireAuth)(context);
            let whereClause = { isActive: true };
            if (organizationId) {
                (0, rbac_1.requireOrganizationAccess)(context, organizationId);
                whereClause = {
                    ...whereClause,
                    organizationMemberships: {
                        some: {
                            organizationId,
                        },
                    },
                };
            }
            else {
                (0, rbac_1.requireRole)(context, ['SUPER_ADMIN']);
            }
            return await context.prisma.user.findMany({
                where: whereClause,
                include: {
                    organizationMemberships: {
                        include: {
                            organization: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        },
        user: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            const user = await context.prisma.user.findUnique({
                where: { id },
                include: {
                    organizationMemberships: {
                        include: {
                            organization: true,
                        },
                    },
                },
            });
            if (!user) {
                throw new graphql_1.GraphQLError('User not found');
            }
            if (context.user?.id !== id && context.user?.role !== 'SUPER_ADMIN') {
                const sharedOrg = user.organizationMemberships.some((membership) => context.user?.organizations.some((org) => org.id === membership.organizationId));
                if (!sharedOrg) {
                    throw new graphql_1.GraphQLError('Insufficient permissions');
                }
            }
            return user;
        },
    },
    Mutation: {
        createUser: async (_parent, { input }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR']);
            try {
                if (!(0, validation_1.validateEmail)(input.email)) {
                    throw new graphql_1.GraphQLError('Invalid email format');
                }
                if (!(0, validation_1.validatePassword)(input.password)) {
                    throw new graphql_1.GraphQLError('Password must be at least 8 characters long');
                }
                const existingUser = await context.prisma.user.findUnique({
                    where: { email: input.email },
                });
                if (existingUser) {
                    throw new graphql_1.GraphQLError('User already exists with this email');
                }
                const hashedPassword = await bcryptjs_1.default.hash(input.password, 12);
                const user = await context.prisma.user.create({
                    data: {
                        email: input.email,
                        password: hashedPassword,
                        firstName: input.firstName,
                        lastName: input.lastName,
                        role: input.role || 'VIEWER',
                    },
                    include: {
                        organizationMemberships: {
                            include: {
                                organization: true,
                            },
                        },
                    },
                });
                logger_1.logger.info(`User created: ${input.email} by ${context.user?.email}`);
                return user;
            }
            catch (error) {
                logger_1.logger.error('Create user error:', error);
                throw error;
            }
        },
        updateUser: async (_parent, { id, input }, context) => {
            (0, rbac_1.requireAuth)(context);
            if (context.user?.id !== id) {
                (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR']);
            }
            try {
                const updateData = {};
                if (input.email && (0, validation_1.validateEmail)(input.email)) {
                    const existingUser = await context.prisma.user.findUnique({
                        where: { email: input.email },
                    });
                    if (existingUser && existingUser.id !== id) {
                        throw new graphql_1.GraphQLError('Email already in use');
                    }
                    updateData.email = input.email;
                }
                if (input.firstName)
                    updateData.firstName = input.firstName;
                if (input.lastName)
                    updateData.lastName = input.lastName;
                if (input.role && context.user?.role === 'SUPER_ADMIN') {
                    updateData.role = input.role;
                }
                const user = await context.prisma.user.update({
                    where: { id },
                    data: updateData,
                    include: {
                        organizationMemberships: {
                            include: {
                                organization: true,
                            },
                        },
                    },
                });
                logger_1.logger.info(`User updated: ${id} by ${context.user?.email}`);
                return user;
            }
            catch (error) {
                logger_1.logger.error('Update user error:', error);
                throw error;
            }
        },
        deleteUser: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN']);
            try {
                if (context.user?.id === id) {
                    throw new graphql_1.GraphQLError('Cannot delete your own account');
                }
                await context.prisma.user.update({
                    where: { id },
                    data: { isActive: false },
                });
                logger_1.logger.info(`User deleted: ${id} by ${context.user?.email}`);
                return true;
            }
            catch (error) {
                logger_1.logger.error('Delete user error:', error);
                throw error;
            }
        },
        toggleUserStatus: async (_parent, { id }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR']);
            try {
                const user = await context.prisma.user.findUnique({
                    where: { id },
                });
                if (!user) {
                    throw new graphql_1.GraphQLError('User not found');
                }
                const updatedUser = await context.prisma.user.update({
                    where: { id },
                    data: { isActive: !user.isActive },
                    include: {
                        organizationMemberships: {
                            include: {
                                organization: true,
                            },
                        },
                    },
                });
                logger_1.logger.info(`User status toggled: ${id} by ${context.user?.email}`);
                return updatedUser;
            }
            catch (error) {
                logger_1.logger.error('Toggle user status error:', error);
                throw error;
            }
        },
    },
    User: {
        organizationMemberships: async (parent, _args, context) => {
            return await context.prisma.organizationMember.findMany({
                where: { userId: parent.id },
                include: {
                    organization: true,
                    user: true,
                },
            });
        },
        createdMissions: async (parent, _args, context) => {
            return await context.prisma.mission.findMany({
                where: { createdById: parent.id },
                include: {
                    drone: true,
                    site: true,
                    organization: true,
                },
            });
        },
        assignedMissions: async (parent, _args, context) => {
            return await context.prisma.mission.findMany({
                where: { assignedToId: parent.id },
                include: {
                    drone: true,
                    site: true,
                    organization: true,
                },
            });
        },
    },
};
//# sourceMappingURL=user.js.map