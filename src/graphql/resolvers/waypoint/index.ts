import { GraphQLError } from 'graphql';
import { Context } from '../types';
import { requireAuth, requireRole, requireOrganizationAccess } from '../../../utils/rbac';
import { logger } from '../../../utils/logger';
import { validateLatitude, validateLongitude, validateAltitude } from '../../../utils/validation';

export const waypointResolvers = {
  Query: {},
  Mutation: {
    addWaypoint: async (
      _parent: any,
      { missionId, input }: { missionId: string; input: any },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        // Get mission to check organization access
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
          throw new GraphQLError('Mission not found');
        }

        requireOrganizationAccess(context, mission.organizationId);

        // Check if mission is not in progress or completed
        if (mission.status === 'IN_PROGRESS' || mission.status === 'COMPLETED') {
          throw new GraphQLError('Cannot modify waypoints for active or completed missions');
        }

        // Validate coordinates
        if (!validateLatitude(input.latitude)) {
          throw new GraphQLError('Invalid latitude value');
        }
        if (!validateLongitude(input.longitude)) {
          throw new GraphQLError('Invalid longitude value');
        }
        if (!validateAltitude(input.altitude)) {
          throw new GraphQLError('Altitude cannot be negative');
        }

        // Auto-assign sequence if not provided
        let sequence = input.sequence;
        if (!sequence) {
          sequence = mission.waypoints.length + 1;
        }

        // Check for sequence conflicts
        const existingWaypoint = mission.waypoints.find(
          (wp: any) => wp.sequence === sequence
        );

        if (existingWaypoint) {
          throw new GraphQLError(`Waypoint with sequence ${sequence} already exists`);
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

        logger.info(`Waypoint added to mission ${missionId} by ${context.user.email}`);
        return waypoint;
      } catch (error) {
        logger.error('Add waypoint error:', error);
        throw error;
      }
    },

    updateWaypoint: async (
      _parent: any,
      { id, input }: { id: string; input: any },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        // Get waypoint to check organization access
        const waypoint = await context.prisma.waypoint.findUnique({
          where: { id },
          include: {
            mission: true,
          },
        });

        if (!waypoint) {
          throw new GraphQLError('Waypoint not found');
        }

        requireOrganizationAccess(context, waypoint.mission.organizationId);

        // Check if mission is not in progress or completed
        if (waypoint.mission.status === 'IN_PROGRESS' || waypoint.mission.status === 'COMPLETED') {
          throw new GraphQLError('Cannot modify waypoints for active or completed missions');
        }

        // Validate coordinates if provided
        if (input.latitude !== undefined && !validateLatitude(input.latitude)) {
          throw new GraphQLError('Invalid latitude value');
        }
        if (input.longitude !== undefined && !validateLongitude(input.longitude)) {
          throw new GraphQLError('Invalid longitude value');
        }
        if (input.altitude !== undefined && !validateAltitude(input.altitude)) {
          throw new GraphQLError('Altitude cannot be negative');
        }

        // Check for sequence conflicts if sequence is being updated
        if (input.sequence !== undefined) {
          const existingWaypoint = await context.prisma.waypoint.findFirst({
            where: {
              missionId: waypoint.missionId,
              sequence: input.sequence,
              id: { not: id },
            },
          });

          if (existingWaypoint) {
            throw new GraphQLError(`Waypoint with sequence ${input.sequence} already exists`);
          }
        }

        const updateData: any = {};
        if (input.sequence !== undefined) updateData.sequence = input.sequence;
        if (input.latitude !== undefined) updateData.latitude = input.latitude;
        if (input.longitude !== undefined) updateData.longitude = input.longitude;
        if (input.altitude !== undefined) updateData.altitude = input.altitude;
        if (input.action !== undefined) updateData.action = input.action;
        if (input.parameters !== undefined) updateData.parameters = input.parameters;

        const updatedWaypoint = await context.prisma.waypoint.update({
          where: { id },
          data: updateData,
          include: {
            mission: true,
          },
        });

        logger.info(`Waypoint updated: ${id} by ${context.user.email}`);
        return updatedWaypoint;
      } catch (error) {
        logger.error('Update waypoint error:', error);
        throw error;
      }
    },

    deleteWaypoint: async (
      _parent: any,
      { id }: { id: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        // Get waypoint to check organization access
        const waypoint = await context.prisma.waypoint.findUnique({
          where: { id },
          include: {
            mission: true,
          },
        });

        if (!waypoint) {
          throw new GraphQLError('Waypoint not found');
        }

        requireOrganizationAccess(context, waypoint.mission.organizationId);

        // Check if mission is not in progress or completed
        if (waypoint.mission.status === 'IN_PROGRESS' || waypoint.mission.status === 'COMPLETED') {
          throw new GraphQLError('Cannot delete waypoints for active or completed missions');
        }

        await context.prisma.waypoint.delete({
          where: { id },
        });

        logger.info(`Waypoint deleted: ${id} by ${context.user.email}`);
        return true;
      } catch (error) {
        logger.error('Delete waypoint error:', error);
        throw error;
      }
    },

    reorderWaypoints: async (
      _parent: any,
      { missionId, waypointIds }: { missionId: string; waypointIds: string[] },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        // Get mission to check organization access
        const mission = await context.prisma.mission.findUnique({
          where: { id: missionId },
          include: {
            waypoints: true,
          },
        });

        if (!mission) {
          throw new GraphQLError('Mission not found');
        }

        requireOrganizationAccess(context, mission.organizationId);

        // Check if mission is not in progress or completed
        if (mission.status === 'IN_PROGRESS' || mission.status === 'COMPLETED') {
          throw new GraphQLError('Cannot reorder waypoints for active or completed missions');
        }

        // Verify all waypoints belong to this mission
        const missionWaypointIds = mission.waypoints.map((wp: any) => wp.id);
        const invalidWaypoints = waypointIds.filter(id => !missionWaypointIds.includes(id));
        
        if (invalidWaypoints.length > 0) {
          throw new GraphQLError('Some waypoints do not belong to this mission');
        }

        // Update waypoint sequences
        const updates = waypointIds.map((waypointId, index) => ({
          where: { id: waypointId },
          data: { sequence: index + 1 },
        }));

        await context.prisma.$transaction(
          updates.map(update => context.prisma.waypoint.update(update))
        );

        // Return updated waypoints
        const updatedWaypoints = await context.prisma.waypoint.findMany({
          where: { missionId },
          include: {
            mission: true,
          },
          orderBy: {
            sequence: 'asc',
          },
        });

        logger.info(`Waypoints reordered for mission ${missionId} by ${context.user.email}`);
        return updatedWaypoints;
      } catch (error) {
        logger.error('Reorder waypoints error:', error);
        throw error;
      }
    },
  },

  Waypoint: {
    mission: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.mission.findUnique({
        where: { id: parent.missionId },
      });
    },
  },
}; 