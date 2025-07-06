import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { Context } from '../types';
import { requireAuth, requireRole, requireOrganizationAccess } from '../../../utils/rbac';
import { logger } from '../../../utils/logger'
import { validateEmail, validatePassword } from '../../../utils/validation';

export const userResolvers = {
  Query: {
    users: async (_parent: any, { organizationId }: { organizationId?: string }, context: Context) => {
      requireAuth(context);

      let whereClause: any = { isActive: true };

      if (organizationId) {
        // Check if user has access to the organization
        requireOrganizationAccess(context, organizationId);
        
        whereClause = {
          ...whereClause,
          organizationMemberships: {
            some: {
              organizationId,
            },
          },
        };
      } else {
        // Only super admins can see all users
        requireRole(context, ['SUPER_ADMIN']);
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

    user: async (_parent: any, { id }: { id: string }, context: Context) => {
      requireAuth(context);

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
        throw new GraphQLError('User not found');
      }

      // Check if user can view this user
      if (context.user?.id !== id && context.user?.role !== 'SUPER_ADMIN') {
        // Check if they share any organization
        const sharedOrg = user.organizationMemberships.some((membership: any) =>
          context.user?.organizations.some((org: any) => org.id === membership.organizationId)
        );
        
        if (!sharedOrg) {
          throw new GraphQLError('Insufficient permissions');
        }
      }

      return user;
    },
  },

  Mutation: {
    createUser: async (
      _parent: any,
      { input }: { input: any },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR']);

      try {
        // Validate input
        if (!validateEmail(input.email)) {
          throw new GraphQLError('Invalid email format');
        }
        if (!validatePassword(input.password)) {
          throw new GraphQLError('Password must be at least 8 characters long');
        }

        // Check if user already exists
        const existingUser = await context.prisma.user.findUnique({
          where: { email: input.email },
        });

        if (existingUser) {
          throw new GraphQLError('User already exists with this email');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 12);

        // Create user
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

        logger.info(`User created: ${input.email} by ${context.user?.email}`);
        return user;
      } catch (error) {
        logger.error('Create user error:', error);
        throw error;
      }
    },

    updateUser: async (
      _parent: any,
      { id, input }: { id: string; input: any },
      context: Context
    ) => {
      requireAuth(context);

      // Users can update themselves, or admins can update others
      if (context.user?.id !== id) {
        requireRole(context, ['SUPER_ADMIN', 'MODERATOR']);
      }

      try {
        const updateData: any = {};

        if (input.email && validateEmail(input.email)) {
          // Check if email is already taken
          const existingUser = await context.prisma.user.findUnique({
            where: { email: input.email },
          });
          
          if (existingUser && existingUser.id !== id) {
            throw new GraphQLError('Email already in use');
          }
          
          updateData.email = input.email;
        }

        if (input.firstName) updateData.firstName = input.firstName;
        if (input.lastName) updateData.lastName = input.lastName;
        
        // Only admins can change roles
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

        logger.info(`User updated: ${id} by ${context.user?.email}`);
        return user;
      } catch (error) {
        logger.error('Update user error:', error);
        throw error;
      }
    },

    deleteUser: async (
      _parent: any,
      { id }: { id: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN']);

      try {
        // Cannot delete yourself
        if (context.user?.id === id) {
          throw new GraphQLError('Cannot delete your own account');
        }

        // Soft delete by deactivating
        await context.prisma.user.update({
          where: { id },
          data: { isActive: false },
        });

        logger.info(`User deleted: ${id} by ${context.user?.email}`);
        return true;
      } catch (error) {
        logger.error('Delete user error:', error);
        throw error;
      }
    },

    toggleUserStatus: async (
      _parent: any,
      { id }: { id: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR']);

      try {
        const user = await context.prisma.user.findUnique({
          where: { id },
        });

        if (!user) {
          throw new GraphQLError('User not found');
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

        logger.info(`User status toggled: ${id} by ${context.user?.email}`);
        return updatedUser;
      } catch (error) {
        logger.error('Toggle user status error:', error);
        throw error;
      }
    },
  },

  User: {
    organizationMemberships: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.organizationMember.findMany({
        where: { userId: parent.id },
        include: {
          organization: true,
          user: true,
        },
      });
    },

    createdMissions: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.mission.findMany({
        where: { createdById: parent.id },
        include: {
          drone: true,
          site: true,
          organization: true,
        },
      });
    },

    assignedMissions: async (parent: any, _args: any, context: Context) => {
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