"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResolvers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const graphql_1 = require("graphql");
const logger_1 = require("../../../utils/logger");
const validation_1 = require("../../../utils/validation");
exports.authResolvers = {
    Query: {
        me: async (_parent, _args, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            return context.user;
        },
    },
    Mutation: {
        register: async (_parent, { email, password, firstName, lastName }, context) => {
            try {
                if (!(0, validation_1.validateEmail)(email)) {
                    throw new graphql_1.GraphQLError('Invalid email format');
                }
                if (!(0, validation_1.validatePassword)(password)) {
                    throw new graphql_1.GraphQLError('Password must be at least 8 characters long');
                }
                const existingUser = await context.prisma.user.findUnique({
                    where: { email },
                });
                if (existingUser) {
                    throw new graphql_1.GraphQLError('User already exists with this email');
                }
                const hashedPassword = await bcryptjs_1.default.hash(password, 12);
                const user = await context.prisma.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        firstName,
                        lastName,
                        role: 'VIEWER',
                    },
                    include: {
                        organizationMemberships: {
                            include: {
                                organization: true,
                            },
                        },
                    },
                });
                const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' });
                logger_1.logger.info(`User registered: ${email}`);
                return {
                    token,
                    user: {
                        ...user,
                        organizations: user.organizationMemberships.map((om) => ({
                            ...om.organization,
                            userRole: om.role,
                        })),
                    },
                };
            }
            catch (error) {
                logger_1.logger.error('Registration error:', error);
                throw error;
            }
        },
        login: async (_parent, { email, password }, context) => {
            try {
                const user = await context.prisma.user.findUnique({
                    where: { email },
                    include: {
                        organizationMemberships: {
                            include: {
                                organization: true,
                            },
                        },
                    },
                });
                if (!user) {
                    throw new graphql_1.GraphQLError('Invalid credentials');
                }
                if (!user.isActive) {
                    throw new graphql_1.GraphQLError('Account is deactivated');
                }
                const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
                if (!isValidPassword) {
                    throw new graphql_1.GraphQLError('Invalid credentials');
                }
                await context.prisma.user.update({
                    where: { id: user.id },
                    data: { lastLogin: new Date() },
                });
                const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' });
                logger_1.logger.info(`User logged in: ${email}`);
                return {
                    token,
                    user: {
                        ...user,
                        organizations: user.organizationMemberships.map((om) => ({
                            ...om.organization,
                            userRole: om.role,
                        })),
                    },
                };
            }
            catch (error) {
                logger_1.logger.error('Login error:', error);
                throw error;
            }
        },
        changePassword: async (_parent, { currentPassword, newPassword }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            try {
                if (!(0, validation_1.validatePassword)(newPassword)) {
                    throw new graphql_1.GraphQLError('New password must be at least 8 characters long');
                }
                const user = await context.prisma.user.findUnique({
                    where: { id: context.user.id },
                });
                if (!user) {
                    throw new graphql_1.GraphQLError('User not found');
                }
                const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
                if (!isValidPassword) {
                    throw new graphql_1.GraphQLError('Current password is incorrect');
                }
                const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
                await context.prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword },
                });
                logger_1.logger.info(`Password changed for user: ${user.email}`);
                return true;
            }
            catch (error) {
                logger_1.logger.error('Change password error:', error);
                throw error;
            }
        },
    },
};
//# sourceMappingURL=auth.js.map