import { Context } from '../types';
export declare const droneResolvers: {
    Query: {
        drones: (_parent: any, { organizationId }: {
            organizationId: string;
        }, context: Context) => Promise<{}>;
        drone: (_parent: any, { id }: {
            id: string;
        }, context: Context) => Promise<{}>;
        availableDrones: (_parent: any, { organizationId }: {
            organizationId: string;
        }, context: Context) => Promise<{}>;
    };
    Mutation: {
        createDrone: (_parent: any, { input }: {
            input: any;
        }, context: Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
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
        }>;
        updateDrone: (_parent: any, { id, input }: {
            id: string;
            input: any;
        }, context: Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
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
        }>;
        deleteDrone: (_parent: any, { id }: {
            id: string;
        }, context: Context) => Promise<boolean>;
        updateDroneStatus: (_parent: any, { id, status }: {
            id: string;
            status: any;
        }, context: Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
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
        }>;
        updateDroneLocation: (_parent: any, { id, latitude, longitude, altitude }: {
            id: string;
            latitude: number;
            longitude: number;
            altitude: number;
        }, context: Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
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
        }>;
        updateDroneBattery: (_parent: any, { id, batteryLevel }: {
            id: string;
            batteryLevel: number;
        }, context: Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
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
        }>;
    };
    Drone: {
        organization: (parent: any, _args: any, context: Context) => Promise<{
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        } | null>;
        missions: (parent: any, _args: any, context: Context) => Promise<({
            createdBy: {
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                isActive: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
            site: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                organizationId: string;
                description: string | null;
                latitude: number;
                longitude: number;
                altitude: number | null;
            };
        } & {
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
        })[]>;
        flightLogs: (parent: any, _args: any, context: Context) => Promise<{
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
};
//# sourceMappingURL=index.d.ts.map