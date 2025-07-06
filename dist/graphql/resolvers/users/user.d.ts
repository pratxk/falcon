import { Context } from '../types';
export declare const userResolvers: {
    Query: {
        users: (_parent: any, { organizationId }: {
            organizationId?: string;
        }, context: Context) => Promise<({
            organizationMemberships: ({
                organization: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                };
            } & {
                userId: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                organizationId: string;
                joinedAt: Date;
            })[];
        } & {
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
        })[]>;
        user: (_parent: any, { id }: {
            id: string;
        }, context: Context) => Promise<{
            organizationMemberships: ({
                organization: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                };
            } & {
                userId: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                organizationId: string;
                joinedAt: Date;
            })[];
        } & {
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
        }>;
    };
    Mutation: {
        createUser: (_parent: any, { input }: {
            input: any;
        }, context: Context) => Promise<{
            organizationMemberships: ({
                organization: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                };
            } & {
                userId: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                organizationId: string;
                joinedAt: Date;
            })[];
        } & {
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
        }>;
        updateUser: (_parent: any, { id, input }: {
            id: string;
            input: any;
        }, context: Context) => Promise<{
            organizationMemberships: ({
                organization: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                };
            } & {
                userId: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                organizationId: string;
                joinedAt: Date;
            })[];
        } & {
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
        }>;
        deleteUser: (_parent: any, { id }: {
            id: string;
        }, context: Context) => Promise<boolean>;
        toggleUserStatus: (_parent: any, { id }: {
            id: string;
        }, context: Context) => Promise<{
            organizationMemberships: ({
                organization: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                };
            } & {
                userId: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                organizationId: string;
                joinedAt: Date;
            })[];
        } & {
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
        }>;
    };
    User: {
        organizationMemberships: (parent: any, _args: any, context: Context) => Promise<({
            user: {
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
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            userId: string;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            organizationId: string;
            joinedAt: Date;
        })[]>;
        createdMissions: (parent: any, _args: any, context: Context) => Promise<({
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
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
        assignedMissions: (parent: any, _args: any, context: Context) => Promise<({
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
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
    };
};
//# sourceMappingURL=user.d.ts.map