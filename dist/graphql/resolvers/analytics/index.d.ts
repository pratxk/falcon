import { Context } from '../types';
export declare const analyticsResolvers: {
    Query: {
        organizationStats: (_parent: any, { organizationId }: {
            organizationId: string;
        }, context: Context) => Promise<{
            totalDrones: number;
            activeDrones: number;
            totalMissions: number;
            completedMissions: number;
            totalSites: number;
            totalFlightHours: number;
            averageMissionDuration: number;
        }>;
        missionStats: (_parent: any, { organizationId, timeRange }: {
            organizationId: string;
            timeRange?: string;
        }, context: Context) => Promise<{
            summary: {
                total: number;
                byStatus: {
                    PLANNED: number;
                    IN_PROGRESS: number;
                    COMPLETED: number;
                    ABORTED: number;
                    FAILED: number;
                };
                byType: {
                    INSPECTION: number;
                    SECURITY_PATROL: number;
                    SITE_MAPPING: number;
                    SURVEY: number;
                };
                averageDuration: number;
                totalFlightTime: number;
                successRate: number;
            };
            dailyStats: {
                date: string | undefined;
                count: number;
                completed: number;
            }[];
            timeRange: {
                start: string;
                end: string;
            };
        }>;
        droneUtilization: (_parent: any, { organizationId }: {
            organizationId: string;
        }, context: Context) => Promise<{
            drones: {
                droneId: string;
                droneName: string;
                model: string;
                status: import(".prisma/client").$Enums.DroneStatus;
                batteryLevel: number;
                totalMissions: number;
                totalFlightTime: number;
                utilizationPercentage: number;
                lastFlight: Date | undefined;
                currentLocation: {
                    latitude: number;
                    longitude: number;
                    altitude: number | null;
                } | null;
            }[];
            summary: {
                totalDrones: number;
                activeDrones: number;
                averageUtilization: number;
                totalFlightTime: number;
                totalMissions: number;
            };
        }>;
    };
};
//# sourceMappingURL=index.d.ts.map