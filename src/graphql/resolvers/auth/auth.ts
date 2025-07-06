import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { Context } from '../types';
import { logger } from '../../../utils/logger';
import { validateEmail, validatePassword } from '../../../utils/validation';

export const authResolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return context.user;
    },
  },

  Mutation: {
    register: async (
      _parent: any,
      { email, password, firstName, lastName }: any,
      context: Context
    ) => {
      try {
        // Validate input
        if (!validateEmail(email)) {
          throw new GraphQLError('Invalid email format');
        }
        if (!validatePassword(password)) {
          throw new GraphQLError('Password must be at least 8 characters long');
        }

        // Check if user already exists
        const existingUser = await context.prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new GraphQLError('User already exists with this email');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await context.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'VIEWER', // Default role
          },
          include: {
            organizationMemberships: {
              include: {
                organization: true,
              },
            },
          },
        });

        // Generate token
        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET!,
          { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions
        );

        logger.info(`User registered: ${email}`);

        return {
          token,
          user: {
            ...user,
            organizations: user.organizationMemberships.map((om: any) => ({
              ...om.organization,
              userRole: om.role,
            })),
          },
        };
      } catch (error) {
        logger.error('Registration error:', error);
        throw error;
      }
    },

    login: async (
      _parent: any,
      { email, password }: { email: string; password: string },
      context: Context
    ) => {
      try {
        // Find user
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
          throw new GraphQLError('Invalid credentials');
        }

        if (!user.isActive) {
          throw new GraphQLError('Account is deactivated');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new GraphQLError('Invalid credentials');
        }

        // Update last login
        await context.prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        // Generate token
        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET!,
          { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions
        );

        logger.info(`User logged in: ${email}`);

        return {
          token,
          user: {
            ...user,
            organizations: user.organizationMemberships.map((om: any) => ({
              ...om.organization,
              userRole: om.role,
            })),
          },
        };
      } catch (error) {
        logger.error('Login error:', error);
        throw error;
      }
    },

    changePassword: async (
      _parent: any,
      { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        // Validate new password
        if (!validatePassword(newPassword)) {
          throw new GraphQLError('New password must be at least 8 characters long');
        }

        // Get user with password
        const user = await context.prisma.user.findUnique({
          where: { id: context.user.id },
        });

        if (!user) {
          throw new GraphQLError('User not found');
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          throw new GraphQLError('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await context.prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });

        logger.info(`Password changed for user: ${user.email}`);
        return true;
      } catch (error) {
        logger.error('Change password error:', error);
        throw error;
      }
    },
  },
};