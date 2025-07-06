"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsResolvers = void 0;
const graphql_1 = require("graphql");
const rbac_1 = require("../../../utils/rbac");
const logger_1 = require("../../../utils/logger");
exports.analyticsResolvers = {
    Query: {
        organizationStats: async (_parent, { organizationId }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireOrganizationAccess)(context, organizationId);
            try {
                const organization = await context.prisma.organization.findUnique({
                    where: { id: organizationId },
                    include: {
                        drones: {
                            where: { isActive: true },
                        },
                        missions: {
                            where: { isActive: true },
                        },
                        sites: {
                            where: { isActive: true },
                        },
                    },
                });
                if (!organization) {
                    throw new graphql_1.GraphQLError('Organization not found');
                }
                const totalDrones = organization.drones.length;
                const activeDrones = organization.drones.filter(drone => drone.status === 'AVAILABLE').length;
                const totalMissions = organization.missions.length;
                const completedMissions = organization.missions.filter(mission => mission.status === 'COMPLETED').length;
                const totalSites = organization.sites.length;
                const completedMissionsWithDuration = organization.missions.filter(mission => mission.status === 'COMPLETED' && mission.estimatedDuration);
                const totalFlightHours = completedMissionsWithDuration.reduce((total, mission) => total + (mission.estimatedDuration || 0), 0) / 60;
                const averageMissionDuration = completedMissionsWithDuration.length > 0
                    ? totalFlightHours / completedMissionsWithDuration.length
                    : 0;
                return {
                    totalDrones,
                    activeDrones,
                    totalMissions,
                    completedMissions,
                    totalSites,
                    totalFlightHours: Math.round(totalFlightHours * 100) / 100,
                    averageMissionDuration: Math.round(averageMissionDuration * 100) / 100,
                };
            }
            catch (error) {
                logger_1.logger.error('Organization stats error:', error);
                throw error;
            }
        },
        missionStats: async (_parent, { organizationId, timeRange }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'VIEWER']);
            (0, rbac_1.requireOrganizationAccess)(context, organizationId);
            try {
                const now = new Date();
                let startDate = new Date();
                switch (timeRange) {
                    case '7d':
                        startDate.setDate(now.getDate() - 7);
                        break;
                    case '30d':
                        startDate.setDate(now.getDate() - 30);
                        break;
                    case '90d':
                        startDate.setDate(now.getDate() - 90);
                        break;
                    case '1y':
                        startDate.setFullYear(now.getFullYear() - 1);
                        break;
                    default:
                        startDate.setDate(now.getDate() - 30);
                }
                const missions = await context.prisma.mission.findMany({
                    where: {
                        organizationId,
                        createdAt: {
                            gte: startDate,
                        },
                    },
                    include: {
                        flightLogs: true,
                    },
                });
                const missionStats = {
                    total: missions.length,
                    byStatus: {
                        PLANNED: missions.filter(m => m.status === 'PLANNED').length,
                        IN_PROGRESS: missions.filter(m => m.status === 'IN_PROGRESS').length,
                        COMPLETED: missions.filter(m => m.status === 'COMPLETED').length,
                        ABORTED: missions.filter(m => m.status === 'ABORTED').length,
                        FAILED: missions.filter(m => m.status === 'FAILED').length,
                    },
                    byType: {
                        INSPECTION: missions.filter(m => m.type === 'INSPECTION').length,
                        SECURITY_PATROL: missions.filter(m => m.type === 'SECURITY_PATROL').length,
                        SITE_MAPPING: missions.filter(m => m.type === 'SITE_MAPPING').length,
                        SURVEY: missions.filter(m => m.type === 'SURVEY').length,
                    },
                    averageDuration: 0,
                    totalFlightTime: 0,
                    successRate: 0,
                };
                const completedMissions = missions.filter(m => m.status === 'COMPLETED');
                const totalDuration = completedMissions.reduce((sum, mission) => sum + (mission.estimatedDuration || 0), 0);
                missionStats.averageDuration = completedMissions.length > 0 ? totalDuration / completedMissions.length : 0;
                missionStats.totalFlightTime = totalDuration;
                missionStats.successRate = missions.length > 0 ? (completedMissions.length / missions.length) * 100 : 0;
                const dailyStats = [];
                const currentDate = new Date(startDate);
                while (currentDate <= now) {
                    const dayStart = new Date(currentDate);
                    dayStart.setHours(0, 0, 0, 0);
                    const dayEnd = new Date(currentDate);
                    dayEnd.setHours(23, 59, 59, 999);
                    const dayMissions = missions.filter(mission => {
                        const missionDate = new Date(mission.createdAt);
                        return missionDate >= dayStart && missionDate <= dayEnd;
                    });
                    dailyStats.push({
                        date: currentDate.toISOString().split('T')[0],
                        count: dayMissions.length,
                        completed: dayMissions.filter(m => m.status === 'COMPLETED').length,
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                return {
                    summary: missionStats,
                    dailyStats,
                    timeRange: {
                        start: startDate.toISOString(),
                        end: now.toISOString(),
                    },
                };
            }
            catch (error) {
                logger_1.logger.error('Mission stats error:', error);
                throw error;
            }
        },
        droneUtilization: async (_parent, { organizationId }, context) => {
            (0, rbac_1.requireAuth)(context);
            (0, rbac_1.requireRole)(context, ['SUPER_ADMIN', 'MODERATOR', 'VIEWER']);
            (0, rbac_1.requireOrganizationAccess)(context, organizationId);
            try {
                const drones = await context.prisma.drone.findMany({
                    where: {
                        organizationId,
                        isActive: true,
                    },
                    include: {
                        missions: {
                            where: {
                                status: 'COMPLETED',
                            },
                        },
                        flightLogs: {
                            orderBy: {
                                timestamp: 'desc',
                            },
                            take: 1,
                        },
                    },
                });
                const droneUtilization = drones.map(drone => {
                    const totalMissions = drone.missions.length;
                    const totalFlightTime = drone.missions.reduce((sum, mission) => sum + (mission.estimatedDuration || 0), 0);
                    const lastFlight = drone.flightLogs[0]?.timestamp;
                    const maxPossibleFlightTime = totalMissions * 8 * 60;
                    const utilizationPercentage = maxPossibleFlightTime > 0 ? (totalFlightTime / maxPossibleFlightTime) * 100 : 0;
                    return {
                        droneId: drone.id,
                        droneName: drone.name,
                        model: drone.model,
                        status: drone.status,
                        batteryLevel: drone.batteryLevel,
                        totalMissions,
                        totalFlightTime,
                        utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
                        lastFlight,
                        currentLocation: drone.currentLatitude && drone.currentLongitude ? {
                            latitude: drone.currentLatitude,
                            longitude: drone.currentLongitude,
                            altitude: drone.currentAltitude,
                        } : null,
                    };
                });
                const totalDrones = droneUtilization.length;
                const activeDrones = droneUtilization.filter(d => d.status === 'AVAILABLE').length;
                const averageUtilization = totalDrones > 0
                    ? droneUtilization.reduce((sum, d) => sum + d.utilizationPercentage, 0) / totalDrones
                    : 0;
                return {
                    drones: droneUtilization,
                    summary: {
                        totalDrones,
                        activeDrones,
                        averageUtilization: Math.round(averageUtilization * 100) / 100,
                        totalFlightTime: droneUtilization.reduce((sum, d) => sum + d.totalFlightTime, 0),
                        totalMissions: droneUtilization.reduce((sum, d) => sum + d.totalMissions, 0),
                    },
                };
            }
            catch (error) {
                logger_1.logger.error('Drone utilization error:', error);
                throw error;
            }
        },
    },
};
//# sourceMappingURL=index.js.map