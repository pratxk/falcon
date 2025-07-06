import { Context } from '../types';
export declare const organizationResolvers: {
    Query: {
        organizations: (_parent: any, _args: any, context: Context) => Promise<({
            _count: {
                sites: number;
                drones: number;
                missions: number;
            };
            members: ({
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
            } & {
                userId: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                organizationId: string;
                joinedAt: Date;
            })[];
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        })[]>;
        organization: (_parent: any, { id }: {
            id: string;
        }, context: Context) => Promise<{
            members: ({
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
            } & {
                userId: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                organizationId: string;
                joinedAt: Date;
            })[];
            sites: {
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
            }[];
            drones: {
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
            }[];
            missions: {
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
            }[];
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        }>;
        myOrganizations: (_parent: any, _args: any, context: Context) => Promise<({
            _count: {
                sites: number;
                drones: number;
                missions: number;
            };
            members: ({
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
            } & {
                userId: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                organizationId: string;
                joinedAt: Date;
            })[];
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        })[]>;
    };
    Mutation: {
        createOrganization: (_parent: any, { input }: {
            input: any;
        }, context: Context) => Promise<{
            members: ({
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
            } & {
                userId: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                organizationId: string;
                joinedAt: Date;
            })[];
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        }>;
        updateOrganization: (_parent: any, { id, input }: {
            id: string;
            input: any;
        }, context: Context) => Promise<{
            members: ({
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
            } & {
                userId: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                organizationId: string;
                joinedAt: Date;
            })[];
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        }>;
        deleteOrganization: (_parent: any, { id }: {
            id: string;
        }, context: Context) => Promise<boolean>;
        addUserToOrganization: (_parent: any, { userId, organizationId, role }: {
            userId: string;
            organizationId: string;
            role: string;
        }, context: Context) => Promise<{
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
        }>;
        removeUserFromOrganization: (_parent: any, { userId, organizationId }: {
            userId: string;
            organizationId: string;
        }, context: Context) => Promise<boolean>;
        updateOrganizationMemberRole: (_parent: any, { userId, organizationId, role }: {
            userId: string;
            organizationId: string;
            role: string;
        }, context: Context) => Promise<{
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
        }>;
    };
    Organization: {
        members: (parent: any, _args: any, context: Context) => Promise<({
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
        } & {
            userId: string;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            organizationId: string;
            joinedAt: Date;
        })[]>;
        sites: (parent: any, _args: any, context: Context) => Promise<{
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
        }[]>;
        drones: (parent: any, _args: any, context: Context) => Promise<{
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
        }[]>;
        missions: (parent: any, _args: any, context: Context) => Promise<{
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
        }[]>;
        stats: (parent: any, _args: any, context: Context) => Promise<{
            totalDrones: number;
            activeDrones: number;
            totalMissions: number;
            completedMissions: number;
            totalSites: number;
            totalFlightHours: number;
            averageMissionDuration: number;
        }>;
    };
};
//# sourceMappingURL=organization.d.ts.map