import { GraphQLError } from 'graphql';
import { Context } from '../types';
import { requireAuth, requireRole, requireOrganizationAccess } from '../../../utils/rbac';
import { logger } from '../../../utils/logger';
import { 
  validateLatitude, 
  validateLongitude, 
  validateAltitude, 
  validateSpeed, 
  validateBatteryLevel, 
  validateGPSAccuracy, 
  validateHeading 
} from '../../../utils/validation';

export const flightLogResolvers = {
  Query: {
    realtimeFlightData: async (_parent: any, { missionId }: { missionId: string }, context: Context) => {
      requireAuth(context);

      // Get mission to check organization access
      const mission = await context.prisma.mission.findUnique({
        where: { id: missionId },
      });

      if (!mission) {
        throw new GraphQLError('Mission not found');
      }

      requireOrganizationAccess(context, mission.organizationId);

      // Return recent flight logs for the mission (last 100 entries)
      return await context.prisma.flightLog.findMany({
        where: {
          missionId,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 100,
      });
    },
  },

  Mutation: {
    logFlightData: async (
      _parent: any,
      { input }: { input: any },
      context: Context
    ) => {
      requireAuth(context);

      try {
        // Get mission to check organization access
        const mission = await context.prisma.mission.findUnique({
          where: { id: input.missionId },
        });

        if (!mission) {
          throw new GraphQLError('Mission not found');
        }

        requireOrganizationAccess(context, mission.organizationId);

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
        if (!validateSpeed(input.speed)) {
          throw new GraphQLError('Speed cannot be negative');
        }
        if (!validateBatteryLevel(input.batteryLevel)) {
          throw new GraphQLError('Battery level must be between 0 and 100');
        }

        // Validate GPS accuracy if provided
        if (input.gpsAccuracy !== undefined && !validateGPSAccuracy(input.gpsAccuracy)) {
          throw new GraphQLError('GPS accuracy cannot be negative');
        }

        // Validate heading if provided
        if (input.heading !== undefined && !validateHeading(input.heading)) {
          throw new GraphQLError('Heading must be between 0 and 360 degrees');
        }

        const flightLog = await context.prisma.flightLog.create({
          data: {
            missionId: input.missionId,
            droneId: input.droneId,
            timestamp: new Date(),
            latitude: input.latitude,
            longitude: input.longitude,
            altitude: input.altitude,
            speed: input.speed,
            batteryLevel: input.batteryLevel,
            gpsAccuracy: input.gpsAccuracy,
            heading: input.heading,
          },
          include: {
            mission: true,
            drone: true,
          },
        });

        // Update drone's current location and battery level
        await context.prisma.drone.update({
          where: { id: input.droneId },
          data: {
            currentLatitude: input.latitude,
            currentLongitude: input.longitude,
            currentAltitude: input.altitude,
            batteryLevel: input.batteryLevel,
          },
        });

        logger.info(`Flight data logged for mission ${input.missionId} by ${context.user.email}`);
        return flightLog;
      } catch (error) {
        logger.error('Log flight data error:', error);
        throw error;
      }
    },
  },

  FlightLog: {
    mission: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.mission.findUnique({
        where: { id: parent.missionId },
      });
    },

    drone: async (parent: any, _args: any, context: Context) => {
      return await context.prisma.drone.findUnique({
        where: { id: parent.droneId },
      });
    },
  },
}; 