import { GraphQLError } from 'graphql';
import { Context } from '../types';
import { requireAuth, requireRole, requireOrganizationAccess } from '../../../utils/rbac';
import { logger } from '../../../utils/logger';
import { validateLatitude, validateLongitude } from '../../../utils/validation';

export const siteResolvers = {
  Query: {
    sites: async (_parent: any, { organizationId }: { organizationId: string }, context: Context) => {
      requireAuth(context);
      requireOrganizationAccess(context, organizationId);

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
            take: 5, // Limit to recent missions
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    },

    site: async (_parent: any, { id }: { id: string }, context: Context) => {
      requireAuth(context);

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
        throw new GraphQLError('Site not found');
      }

      // Check if user has access to the organization
      requireOrganizationAccess(context, site.organizationId);

      return site;
    },
  },

  Mutation: {
    createSite: async (
      _parent: any,
      { input }: { input: any },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
      requireOrganizationAccess(context, input.organizationId);

      try {
        // Validate coordinates
        if (!validateLatitude(input.latitude)) {
          throw new GraphQLError('Invalid latitude value');
        }
        if (!validateLongitude(input.longitude)) {
          throw new GraphQLError('Invalid longitude value');
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

        logger.info(`Site created: ${input.name} by ${context.user?.email}`);
        return site;
      } catch (error) {
        logger.error('Create site error:', error);
        throw error;
      }
    },

    updateSite: async (
      _parent: any,
      { id, input }: { id: string; input: any },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        // Get existing site to check organization access
        const existingSite = await context.prisma.site.findUnique({
          where: { id },
        });

        if (!existingSite) {
          throw new GraphQLError('Site not found');
        }

        requireOrganizationAccess(context, existingSite.organizationId);

        // Validate coordinates if provided
        if (input.latitude !== undefined && (input.latitude < -90 || input.latitude > 90)) {
          throw new GraphQLError('Invalid latitude value');
        }
        if (input.longitude !== undefined && (input.longitude < -180 || input.longitude > 180)) {
          throw new GraphQLError('Invalid longitude value');
        }

        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.latitude !== undefined) updateData.latitude = input.latitude;
        if (input.longitude !== undefined) updateData.longitude = input.longitude;
        if (input.altitude !== undefined) updateData.altitude = input.altitude;

        const site = await context.prisma.site.update({
          where: { id },
          data: updateData,
          include: {
            organization: true,
          },
        });

        logger.info(`Site updated: ${id} by ${context.user?.email}`);
        return site;
      } catch (error) {
        logger.error('Update site error:', error);
        throw error;
      }
    },

    deleteSite: async (
      _parent: any,
      { id }: { id: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR']);

      try {
        // Get existing site to check organization access
        const existingSite = await context.prisma.site.findUnique({
          where: { id },
          include: {
            missions: true,
          },
        });

        if (!existingSite) {
          throw new GraphQLError('Site not found');
        }

        requireOrganizationAccess(context, existingSite.organizationId);

        // Check if site has active missions
        const activeMissions = existingSite.missions.filter(
          (mission: any) => mission.status === 'IN_PROGRESS' || mission.status === 'PLANNED'
        );

        if (activeMissions.length > 0) {
          throw new GraphQLError('Cannot delete site with active missions');
        }

        // Soft delete by setting isActive to false
        await context.prisma.site.update({
          where: { id },
          data: { isActive: false },
        });

        logger.info(`Site deleted: ${id} by ${context.user?.email}`);
        return true;
      } catch (error) {
        logger.error('Delete site error:', error);
        throw error;
      }
    },
  },

  Site: {
    organization: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.organization.findUnique({
        where: { id: parent.organizationId },
      });
    },

    missions: async (parent: any, _args: any, context: Context) => {
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