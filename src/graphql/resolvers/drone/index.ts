import { GraphQLError } from 'graphql';
import { Context } from '../types';
import { requireAuth, requireRole, requireOrganizationAccess } from '../../../utils/rbac';
import { logger } from '../../../utils/logger';
import { 
  validateLatitude, 
  validateLongitude, 
  validateAltitude, 
  validateBatteryLevel,
  validateDroneInput 
} from '../../../utils/validation';

export const droneResolvers = {
  Query: {
    drones: async (_parent: any, { organizationId }: { organizationId: string }, context: Context) => {
      requireAuth(context);
      requireOrganizationAccess(context, organizationId);

      return await context.prisma.drone.findMany({
        where: {
          organizationId,
          isActive: true,
        },
        include: {
          organization: true,
          missions: {
            where: {
              status: 'IN_PROGRESS',
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    },

    drone: async (_parent: any, { id }: { id: string }, context: Context) => {
      requireAuth(context);

      const drone = await context.prisma.drone.findUnique({
        where: { id },
        include: {
          organization: true,
          missions: {
            include: {
              site: true,
              createdBy: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          flightLogs: {
            orderBy: {
              timestamp: 'desc',
            },
            take: 100, // Limit to recent flight logs
          },
        },
      });

      if (!drone) {
        throw new GraphQLError('Drone not found');
      }

      requireOrganizationAccess(context, drone.organizationId);

      return drone;
    },

    availableDrones: async (_parent: any, { organizationId }: { organizationId: string }, context: Context) => {
      requireAuth(context);
      requireOrganizationAccess(context, organizationId);

      return await context.prisma.drone.findMany({
        where: {
          organizationId,
          isActive: true,
          status: 'AVAILABLE',
          batteryLevel: {
            gte: 20, // Only drones with sufficient battery
          },
        },
        include: {
          organization: true,
        },
        orderBy: {
          batteryLevel: 'desc',
        },
      });
    },
  },

  Mutation: {
    createDrone: async (
      _parent: any,
      { input }: { input: any },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);
      requireOrganizationAccess(context, input.organizationId);

      try {
        // Validate drone input
        const validation = validateDroneInput(input);
        if (!validation.isValid) {
          throw new GraphQLError(`Invalid drone input: ${validation.errors.join(', ')}`);
        }

        const drone = await context.prisma.drone.create({
          data: {
            name: input.name,
            model: input.model,
            serialNumber: input.serialNumber,
            organizationId: input.organizationId,
            status: 'AVAILABLE',
            batteryLevel: 100,
            maxFlightTime: input.maxFlightTime,
            maxSpeed: input.maxSpeed,
            maxAltitude: input.maxAltitude,
            cameraResolution: input.cameraResolution,
            sensorTypes: input.sensorTypes || [],
            isActive: true,
          },
          include: {
            organization: true,
          },
        });

        logger.info(`Drone created: ${input.name} by ${context.user.email}`);
        return drone;
      } catch (error) {
        logger.error('Create drone error:', error);
        throw error;
      }
    },

    updateDrone: async (
      _parent: any,
      { id, input }: { id: string; input: any },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        // Get existing drone to check organization access
        const existingDrone = await context.prisma.drone.findUnique({
          where: { id },
        });

        if (!existingDrone) {
          throw new GraphQLError('Drone not found');
        }

        requireOrganizationAccess(context, existingDrone.organizationId);

        // Validate drone input if provided
        if (input) {
          const validation = validateDroneInput({ ...existingDrone, ...input });
          if (!validation.isValid) {
            throw new GraphQLError(`Invalid drone input: ${validation.errors.join(', ')}`);
          }
        }

        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.model) updateData.model = input.model;
        if (input.maxFlightTime !== undefined) updateData.maxFlightTime = input.maxFlightTime;
        if (input.maxSpeed !== undefined) updateData.maxSpeed = input.maxSpeed;
        if (input.maxAltitude !== undefined) updateData.maxAltitude = input.maxAltitude;
        if (input.cameraResolution !== undefined) updateData.cameraResolution = input.cameraResolution;
        if (input.sensorTypes !== undefined) updateData.sensorTypes = input.sensorTypes;

        const drone = await context.prisma.drone.update({
          where: { id },
          data: updateData,
          include: {
            organization: true,
          },
        });

        logger.info(`Drone updated: ${id} by ${context.user.email}`);
        return drone;
      } catch (error) {
        logger.error('Update drone error:', error);
        throw error;
      }
    },

    deleteDrone: async (
      _parent: any,
      { id }: { id: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR']);

      try {
        // Get existing drone to check organization access
        const existingDrone = await context.prisma.drone.findUnique({
          where: { id },
          include: {
            missions: true,
          },
        });

        if (!existingDrone) {
          throw new GraphQLError('Drone not found');
        }

        requireOrganizationAccess(context, existingDrone.organizationId);

        // Check if drone has active missions
        const activeMissions = existingDrone.missions.filter(
          (mission: any) => mission.status === 'IN_PROGRESS' || mission.status === 'PLANNED'
        );

        if (activeMissions.length > 0) {
          throw new GraphQLError('Cannot delete drone with active missions');
        }

        // Soft delete by setting isActive to false
        await context.prisma.drone.update({
          where: { id },
          data: { isActive: false },
        });

        logger.info(`Drone deleted: ${id} by ${context.user.email}`);
        return true;
      } catch (error) {
        logger.error('Delete drone error:', error);
        throw error;
      }
    },

    updateDroneStatus: async (
      _parent: any,
      { id, status }: { id: string; status: string },
      context: Context
    ) => {
      requireAuth(context);
      requireRole(context, ['SUPER_ADMIN', 'MODERATOR', 'OPERATOR']);

      try {
        // Get existing drone to check organization access
        const existingDrone = await context.prisma.drone.findUnique({
          where: { id },
        });

        if (!existingDrone) {
          throw new GraphQLError('Drone not found');
        }

        requireOrganizationAccess(context, existingDrone.organizationId);

        const drone = await context.prisma.drone.update({
          where: { id },
          data: { status },
          include: {
            organization: true,
          },
        });

        logger.info(`Drone status updated: ${id} to ${status} by ${context.user.email}`);
        return drone;
      } catch (error) {
        logger.error('Update drone status error:', error);
        throw error;
      }
    },

    updateDroneLocation: async (
      _parent: any,
      { id, latitude, longitude, altitude }: { id: string; latitude: number; longitude: number; altitude: number },
      context: Context
    ) => {
      requireAuth(context);

      try {
        // Get existing drone to check organization access
        const existingDrone = await context.prisma.drone.findUnique({
          where: { id },
        });

        if (!existingDrone) {
          throw new GraphQLError('Drone not found');
        }

        requireOrganizationAccess(context, existingDrone.organizationId);

        // Validate coordinates
        if (!validateLatitude(latitude)) {
          throw new GraphQLError('Invalid latitude value');
        }
        if (!validateLongitude(longitude)) {
          throw new GraphQLError('Invalid longitude value');
        }
        if (!validateAltitude(altitude)) {
          throw new GraphQLError('Altitude cannot be negative');
        }

        const drone = await context.prisma.drone.update({
          where: { id },
          data: {
            currentLatitude: latitude,
            currentLongitude: longitude,
            currentAltitude: altitude,
          },
          include: {
            organization: true,
          },
        });

        logger.info(`Drone location updated: ${id} by ${context.user.email}`);
        return drone;
      } catch (error) {
        logger.error('Update drone location error:', error);
        throw error;
      }
    },

    updateDroneBattery: async (
      _parent: any,
      { id, batteryLevel }: { id: string; batteryLevel: number },
      context: Context
    ) => {
      requireAuth(context);

      try {
        // Get existing drone to check organization access
        const existingDrone = await context.prisma.drone.findUnique({
          where: { id },
        });

        if (!existingDrone) {
          throw new GraphQLError('Drone not found');
        }

        requireOrganizationAccess(context, existingDrone.organizationId);

        // Validate battery level
        if (!validateBatteryLevel(batteryLevel)) {
          throw new GraphQLError('Battery level must be between 0 and 100');
        }

        const drone = await context.prisma.drone.update({
          where: { id },
          data: { batteryLevel },
          include: {
            organization: true,
          },
        });

        logger.info(`Drone battery updated: ${id} to ${batteryLevel}% by ${context.user.email}`);
        return drone;
      } catch (error) {
        logger.error('Update drone battery error:', error);
        throw error;
      }
    },
  },

  Drone: {
    organization: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.organization.findUnique({
        where: { id: parent.organizationId },
      });
    },

    missions: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.mission.findMany({
        where: {
          droneId: parent.id,
        },
        include: {
          site: true,
          createdBy: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    },

    flightLogs: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.flightLog.findMany({
        where: {
          droneId: parent.id,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
    },
  },
}; 