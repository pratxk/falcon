import { Context } from '../types';
export declare const flightLogResolvers: {
    Query: {
        realtimeFlightData: (_parent: any, { missionId }: {
            missionId: string;
        }, context: Context) => Promise<{
            id: string;
            droneId: string;
            latitude: number;
            longitude: number;
            altitude: number;
            batteryLevel: number;
            timestamp: Date;
            missionId: string;
            speed: number;
            gpsAccuracy: number | null;
            heading: number | null;
        }[]>;
    };
    Mutation: {
        logFlightData: (_parent: any, { input }: {
            input: any;
        }, context: Context) => Promise<{
            mission: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                organizationId: string;
                description: string | null;
                type: import(".prisma/client").$Enums.MissionType;
                status: import(".prisma/client").$Enums.MissionStatus;
                priority: number;
                flightPattern: import(".prisma/client").$Enums.FlightPattern;
                plannedAltitude: number;
                plannedSpeed: number;
                overlapPercentage: number;
                scheduledAt: Date | null;
                startedAt: Date | null;
                completedAt: Date | null;
                estimatedDuration: number | null;
                createdById: string;
                assignedToId: string | null;
                droneId: string;
                siteId: string;
            };
            drone: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                organizationId: string;
                status: import(".prisma/client").$Enums.DroneStatus;
                model: string;
                serialNumber: string;
                batteryLevel: number;
                lastMaintenanceAt: Date | null;
                currentLatitude: number | null;
                currentLongitude: number | null;
                currentAltitude: number | null;
                maxFlightTime: number;
                maxSpeed: number;
                maxAltitude: number;
                cameraResolution: string | null;
                sensorTypes: string[];
            };
        } & {
            id: string;
            droneId: string;
            latitude: number;
            longitude: number;
            altitude: number;
            batteryLevel: number;
            timestamp: Date;
            missionId: string;
            speed: number;
            gpsAccuracy: number | null;
            heading: number | null;
        }>;
    };
    FlightLog: {
        mission: (parent: any, _args: any, context: Context) => Promise<{
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            organizationId: string;
            description: string | null;
            type: import(".prisma/client").$Enums.MissionType;
            status: import(".prisma/client").$Enums.MissionStatus;
            priority: number;
            flightPattern: import(".prisma/client").$Enums.FlightPattern;
            plannedAltitude: number;
            plannedSpeed: number;
            overlapPercentage: number;
            scheduledAt: Date | null;
            startedAt: Date | null;
            completedAt: Date | null;
            estimatedDuration: number | null;
            createdById: string;
            assignedToId: string | null;
            droneId: string;
            siteId: string;
        } | null>;
        drone: (parent: any, _args: any, context: Context) => Promise<{
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            organizationId: string;
            status: import(".prisma/client").$Enums.DroneStatus;
            model: string;
            serialNumber: string;
            batteryLevel: number;
            lastMaintenanceAt: Date | null;
            currentLatitude: number | null;
            currentLongitude: number | null;
            currentAltitude: number | null;
            maxFlightTime: number;
            maxSpeed: number;
            maxAltitude: number;
            cameraResolution: string | null;
            sensorTypes: string[];
        } | null>;
    };
};
//# sourceMappingURL=index.d.ts.map