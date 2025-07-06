import { GraphQLError } from 'graphql';
import { Context } from '../types';
import { requireAuth, requireRole, requireOrganizationAccess } from '../../../utils/rbac';
import { logger } from '../../../utils/logger';
import { cacheService, cacheKeys, cacheInvalidation } from '../../../utils/cache';

export const missionResolvers = {
  Query: {
    missions: async (_parent: any, { organizationId, status }: { organizationId: string; status?: string }, context: Context) => {
      requireAuth(context);
      requireOrganizationAccess(context, organizationId);

      // Try to get from cache first
      const cacheKey = cacheKeys.missions(organizationId, status);
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for missions: ${organizationId}`);
        return cached;
      }

      const whereClause: any = {
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

      // Cache the result for 5 minutes
      await cacheService.set(cacheKey, missions, { ttl: 300 });
      logger.debug(`Cached missions for organization: ${organizationId}`);

      return missions;
    },

    mission: async (_parent: any, { id }: { id: string }, context: Context) => {
      requireAuth(context);

      // Try to get from cache first
      const cacheKey = cacheKeys.mission(id);
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for mission: ${id}`);
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
        throw new GraphQLError('Mission not found');
      }

      requireOrganizationAccess(context, mission.organizationId);

      // Cache the result for 10 minutes (longer TTL for individual missions)
      await cacheService.set(cacheKey, mission, { ttl: 600 });
      logger.debug(`Cached mission: ${id}`);

      return mission;
    },

    myMissions: async (_parent: any, _args: any, context: Context) => {
      requireAuth(context);

      // Try to get from cache first
      const cacheKey = cacheKeys.myMissions(context.user?.id || '');
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for myMissions: ${context.user?.id}`);
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

      // Cache the result for 5 minutes
      await cacheService.set(cacheKey, missions, { ttl: 300 });
      logger.debug(`Cached myMissions for user: ${context.user?.id || 'unknown'}`);

      return missions;
    },

    activeMissions: async (_parent: any, { organizationId }: { organizationId: string }, context: Context) => {
      requireAuth(context);
      requireOrganizationAccess(context, organizationId);

      // Try to get from cache first
      const cacheKey = cacheKeys.activeMissions(organizationId);
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for activeMissions: ${organizationId}`);
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

      // Cache the result for 2 minutes (shorter TTL for active missions)
      await cacheService.set(cacheKey, missions, { ttl: 120 });
      logger.debug(`Cached activeMissions for organization: ${organizationId}`);

      return missions;
    },
  },

  Mutation: {
    createMission: async (
      _parent: any,
      { input }: { input: any },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
      requireOrganizationAccess(context, input.organizationId);

      try {
        // Validate mission parameters
        if (input.plannedAltitude <= 0) {
          throw new GraphQLError('Planned altitude must be positive');
        }
        if (input.plannedSpeed <= 0) {
          throw new GraphQLError('Planned speed must be positive');
        }
        if (input.overlapPercentage < 0 || input.overlapPercentage > 100) {
          throw new GraphQLError('Overlap percentage must be between 0 and 100');
        }

        // Check if drone is available
        const drone = await context.prisma.drone.findUnique({
          where: { id: input.droneId },
        });

        if (!drone) {
          throw new GraphQLError('Drone not found');
        }

        if (drone.status !== 'AVAILABLE') {
          throw new GraphQLError('Selected drone is not available');
        }

        // Check if site exists
        const site = await context.prisma.site.findUnique({
          where: { id: input.siteId },
        });

        if (!site) {
          throw new GraphQLError('Site not found');
        }

        // Create mission
        const missionData: any = {
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

        // Create waypoints if provided
        if (input.waypoints && input.waypoints.length > 0) {
          const waypointData = input.waypoints.map((wp: any, index: number) => ({
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

        // Invalidate related caches
        await cacheInvalidation.missions(input.organizationId);
        await cacheInvalidation.drones(input.organizationId);

        logger.info(`Mission created: ${input.name} by ${context.user?.email}`);
        return mission;
      } catch (error) {
        logger.error('Create mission error:', error);
        throw error;
      }
    },

    updateMission: async (
      _parent: any,
      { id, input }: { id: string; input: any },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        // Get existing mission to check organization access
        const existingMission = await context.prisma.mission.findUnique({
          where: { id },
        });

        if (!existingMission) {
          throw new GraphQLError('Mission not found');
        }

        requireOrganizationAccess(context, existingMission.organizationId);

        // Check if mission can be updated
        if (existingMission.status === 'IN_PROGRESS' || existingMission.status === 'COMPLETED') {
          throw new GraphQLError('Cannot update active or completed missions');
        }

        // Validate parameters if provided
        if (input.plannedAltitude !== undefined && input.plannedAltitude <= 0) {
          throw new GraphQLError('Planned altitude must be positive');
        }
        if (input.plannedSpeed !== undefined && input.plannedSpeed <= 0) {
          throw new GraphQLError('Planned speed must be positive');
        }
        if (input.overlapPercentage !== undefined && (input.overlapPercentage < 0 || input.overlapPercentage > 100)) {
          throw new GraphQLError('Overlap percentage must be between 0 and 100');
        }

        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.type) updateData.type = input.type;
        if (input.priority !== undefined) updateData.priority = input.priority;
        if (input.flightPattern) updateData.flightPattern = input.flightPattern;
        if (input.plannedAltitude !== undefined) updateData.plannedAltitude = input.plannedAltitude;
        if (input.plannedSpeed !== undefined) updateData.plannedSpeed = input.plannedSpeed;
        if (input.overlapPercentage !== undefined) updateData.overlapPercentage = input.overlapPercentage;
        if (input.scheduledAt !== undefined) updateData.scheduledAt = input.scheduledAt;
        if (input.estimatedDuration !== undefined) updateData.estimatedDuration = input.estimatedDuration;
        if (input.droneId) updateData.droneId = input.droneId;
        if (input.siteId) updateData.siteId = input.siteId;

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

        // Invalidate related caches
        await cacheInvalidation.mission(id, existingMission.organizationId);

        logger.info(`Mission updated: ${id} by ${context.user?.email}`);
        return mission;
      } catch (error) {
        logger.error('Update mission error:', error);
        throw error;
      }
    },

    deleteMission: async (
      _parent: any,
      { id }: { id: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR']);

      try {
        // Get existing mission to check organization access
        const existingMission = await context.prisma.mission.findUnique({
          where: { id },
        });

        if (!existingMission) {
          throw new GraphQLError('Mission not found');
        }

        requireOrganizationAccess(context, existingMission.organizationId);

        // Check if mission can be deleted
        if (existingMission.status === 'IN_PROGRESS') {
          throw new GraphQLError('Cannot delete mission in progress');
        }

        // Soft delete by setting isActive to false
        await context.prisma.mission.update({
          where: { id },
          data: { isActive: false },    
        });

        // Invalidate related caches
        await cacheInvalidation.mission(id, existingMission.organizationId);

        logger.info(`Mission deleted: ${id} by ${context.user?.email}`);
        return true;
      } catch (error) {
        logger.error('Delete mission error:', error);
        throw error;
      }
    },

    startMission: async (
      _parent: any,
      { id }: { id: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        const mission = await context.prisma.mission.findUnique({
          where: { id },
          include: {
            drone: true,
          },
        });

        if (!mission) {
          throw new GraphQLError('Mission not found');
        }

        requireOrganizationAccess(context, mission.organizationId);

        if (mission.status !== 'PLANNED') {
          throw new GraphQLError('Only planned missions can be started');
        }

        if (mission.drone.status !== 'AVAILABLE') {
          throw new GraphQLError('Drone is not available');
        }

        // Update mission and drone status
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

        logger.info(`Mission started: ${id} by ${context.user?.email}`);
        return updatedMission;
      } catch (error) {
        logger.error('Start mission error:', error);
        throw error;
      }
    },

    pauseMission: async (
      _parent: any,
      { id }: { id: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        const mission = await context.prisma.mission.findUnique({
          where: { id },
        });

        if (!mission) {
          throw new GraphQLError('Mission not found');
        }

        requireOrganizationAccess(context, mission.organizationId);

        if (mission.status !== 'IN_PROGRESS') {
          throw new GraphQLError('Only missions in progress can be paused');
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

        logger.info(`Mission paused: ${id} by ${context.user?.email}`);
        return updatedMission;
      } catch (error) {
        logger.error('Pause mission error:', error);
        throw error;
      }
    },

    resumeMission: async (
      _parent: any,
      { id }: { id: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        const mission = await context.prisma.mission.findUnique({
          where: { id },
        });

        if (!mission) {
          throw new GraphQLError('Mission not found');
        }

        requireOrganizationAccess(context, mission.organizationId);

        if (mission.status !== 'PLANNED') {
          throw new GraphQLError('Only paused missions can be resumed');
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

        logger.info(`Mission resumed: ${id} by ${context.user?.email}`);
        return updatedMission;
      } catch (error) {
        logger.error('Resume mission error:', error);
        throw error;
      }
    },

    abortMission: async (
      _parent: any,
      { id }: { id: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        const mission = await context.prisma.mission.findUnique({
          where: { id },
          include: {
            drone: true,
          },
        });

        if (!mission) {
          throw new GraphQLError('Mission not found');
        }

        requireOrganizationAccess(context, mission.organizationId);

        if (mission.status !== 'IN_PROGRESS' && mission.status !== 'PLANNED') {
          throw new GraphQLError('Only active or planned missions can be aborted');
        }

        // Update mission and drone status
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

        logger.info(`Mission aborted: ${id} by ${context.user?.email}`);
        return updatedMission;
      } catch (error) {
        logger.error('Abort mission error:', error);
        throw error;
      }
    },

    completeMission: async (
      _parent: any,
      { id }: { id: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        const mission = await context.prisma.mission.findUnique({
          where: { id },
          include: {
            drone: true,
          },
        });

        if (!mission) {
          throw new GraphQLError('Mission not found');
        }

        requireOrganizationAccess(context, mission.organizationId);

        if (mission.status !== 'IN_PROGRESS') {
          throw new GraphQLError('Only missions in progress can be completed');
        }

        // Update mission and drone status
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

        logger.info(`Mission completed: ${id} by ${context.user?.email}`);
        return updatedMission;
      } catch (error) {
        logger.error('Complete mission error:', error);
        throw error;
      }
    },

    assignMission: async (
      _parent: any,
      { id, userId }: { id: string; userId: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR']);

      try {
        const mission = await context.prisma.mission.findUnique({
          where: { id },
        });

        if (!mission) {
          throw new GraphQLError('Mission not found');
        }

        requireOrganizationAccess(context, mission.organizationId);

        // Check if user exists and has access to the organization
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
          throw new GraphQLError('User not found');
        }

        if (user.organizationMemberships.length === 0) {
          throw new GraphQLError('User does not have access to this organization');
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

        logger.info(`Mission assigned: ${id} to user ${userId} by ${context.user?.email}`);
        return updatedMission;
      } catch (error) {
        logger.error('Assign mission error:', error);
        throw error;
      }
    },
  },

  Mission: {
    createdBy: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.user.findUnique({
        where: { id: parent.createdById },
      });
    },

    assignedTo: async (parent: any, _args: any, context: Context) => {
      if (!parent.assignedToId) return null;
      return await context.prisma.user.findUnique({
        where: { id: parent.assignedToId },
      });
    },

    drone: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.drone.findUnique({
        where: { id: parent.droneId },
      });
    },

    site: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.site.findUnique({
        where: { id: parent.siteId },
      });
    },

    organization: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.organization.findUnique({
        where: { id: parent.organizationId },
      });
    },

    waypoints: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.waypoint.findMany({
        where: { missionId: parent.id },
        orderBy: { sequence: 'asc' },
      });
    },

    flightLogs: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.flightLog.findMany({
        where: { missionId: parent.id },
        orderBy: { timestamp: 'desc' },
      });
    },

    surveyData: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.surveyData.findMany({
        where: { missionId: parent.id },
        orderBy: { capturedAt: 'desc' },
      });
    },

    progress: async (parent: any, _args: any, context: Context) => {
      if (parent.status === 'COMPLETED') return 100;
      if (parent.status === 'PLANNED') return 0;
      if (parent.status === 'ABORTED' || parent.status === 'FAILED') return 0;

      // Calculate progress based on waypoints completed
      const waypoints = await context.prisma.waypoint.findMany({
        where: { missionId: parent.id },
        orderBy: { sequence: 'asc' },
      });

      if (waypoints.length === 0) return 0;

      // For now, return a simple progress based on mission duration
      // In a real implementation, this would be calculated from actual flight data
      if (parent.startedAt && parent.estimatedDuration) {
        const elapsed = Date.now() - new Date(parent.startedAt).getTime();
        const estimatedMs = parent.estimatedDuration * 60 * 1000; // Convert minutes to ms
        const progress = Math.min((elapsed / estimatedMs) * 100, 95); // Cap at 95% until completed
        return Math.round(progress);
      }

      return 0;
    },
  },
};