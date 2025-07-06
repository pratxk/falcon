export declare const resolvers: {
    DateTime: import("graphql").GraphQLScalarType<Date, Date>;
    JSON: import("graphql").GraphQLScalarType<any, any>;
    Query: {
        organizationStats: (_parent: any, { organizationId }: {
            organizationId: string;
        }, context: import("./types").Context) => Promise<{
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
        }, context: import("./types").Context) => Promise<{
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
        }, context: import("./types").Context) => Promise<{
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
        realtimeFlightData: (_parent: any, { missionId }: {
            missionId: string;
        }, context: import("./types").Context) => Promise<{
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
        missions: (_parent: any, { organizationId, status }: {
            organizationId: string;
            status?: string;
        }, context: import("./types").Context) => Promise<{}>;
        mission: (_parent: any, { id }: {
            id: string;
        }, context: import("./types").Context) => Promise<{}>;
        myMissions: (_parent: any, _args: any, context: import("./types").Context) => Promise<{}>;
        activeMissions: (_parent: any, { organizationId }: {
            organizationId: string;
        }, context: import("./types").Context) => Promise<{}>;
        drones: (_parent: any, { organizationId }: {
            organizationId: string;
        }, context: import("./types").Context) => Promise<{}>;
        drone: (_parent: any, { id }: {
            id: string;
        }, context: import("./types").Context) => Promise<{}>;
        availableDrones: (_parent: any, { organizationId }: {
            organizationId: string;
        }, context: import("./types").Context) => Promise<{}>;
        sites: (_parent: any, { organizationId }: {
            organizationId: string;
        }, context: import("./types").Context) => Promise<({
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
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
            organizationId: string;
            description: string | null;
            latitude: number;
            longitude: number;
            altitude: number | null;
        })[]>;
        site: (_parent: any, { id }: {
            id: string;
        }, context: import("./types").Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
            missions: ({
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
            })[];
        } & {
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
        }>;
        organizations: (_parent: any, _args: any, context: import("./types").Context) => Promise<({
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
        }, context: import("./types").Context) => Promise<{
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
        myOrganizations: (_parent: any, _args: any, context: import("./types").Context) => Promise<({
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
        users: (_parent: any, { organizationId }: {
            organizationId?: string;
        }, context: import("./types").Context) => Promise<({
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
        }, context: import("./types").Context) => Promise<{
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
        me: (_parent: any, _args: any, context: import("./types").Context) => Promise<{
            id: string;
            email: string;
            role: string;
            organizations: any[];
        }>;
    };
    Mutation: {
        logFlightData: (_parent: any, { input }: {
            input: any;
        }, context: import("./types").Context) => Promise<{
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
        addWaypoint: (_parent: any, { missionId, input }: {
            missionId: string;
            input: any;
        }, context: import("./types").Context) => Promise<{
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
        } & {
            id: string;
            latitude: number;
            longitude: number;
            altitude: number;
            sequence: number;
            missionId: string;
            action: string | null;
            parameters: import("@prisma/client/runtime/library").JsonValue | null;
        }>;
        updateWaypoint: (_parent: any, { id, input }: {
            id: string;
            input: any;
        }, context: import("./types").Context) => Promise<{
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
        } & {
            id: string;
            latitude: number;
            longitude: number;
            altitude: number;
            sequence: number;
            missionId: string;
            action: string | null;
            parameters: import("@prisma/client/runtime/library").JsonValue | null;
        }>;
        deleteWaypoint: (_parent: any, { id }: {
            id: string;
        }, context: import("./types").Context) => Promise<boolean>;
        reorderWaypoints: (_parent: any, { missionId, waypointIds }: {
            missionId: string;
            waypointIds: string[];
        }, context: import("./types").Context) => Promise<({
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
        } & {
            id: string;
            latitude: number;
            longitude: number;
            altitude: number;
            sequence: number;
            missionId: string;
            action: string | null;
            parameters: import("@prisma/client/runtime/library").JsonValue | null;
        })[]>;
        createMission: (_parent: any, { input }: {
            input: any;
        }, context: import("./types").Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
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
        }>;
        updateMission: (_parent: any, { id, input }: {
            id: string;
            input: any;
        }, context: import("./types").Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
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
        }>;
        deleteMission: (_parent: any, { id }: {
            id: string;
        }, context: import("./types").Context) => Promise<boolean>;
        startMission: (_parent: any, { id }: {
            id: string;
        }, context: import("./types").Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
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
        }>;
        pauseMission: (_parent: any, { id }: {
            id: string;
        }, context: import("./types").Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
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
        }>;
        resumeMission: (_parent: any, { id }: {
            id: string;
        }, context: import("./types").Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
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
        }>;
        abortMission: (_parent: any, { id }: {
            id: string;
        }, context: import("./types").Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
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
        }>;
        completeMission: (_parent: any, { id }: {
            id: string;
        }, context: import("./types").Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
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
        }>;
        assignMission: (_parent: any, { id, userId }: {
            id: string;
            userId: string;
        }, context: import("./types").Context) => Promise<{
            organization: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
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
            assignedTo: {
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
            } | null;
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
        }>;
        createDrone: (_parent: any, { input }: {
            input: any;
        }, context: import("./types").Context) => Promise<{
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
        }, context: import("./types").Context) => Promise<{
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
        }, context: import("./types").Context) => Promise<boolean>;
        updateDroneStatus: (_parent: any, { id, status }: {
            id: string;
            status: any;
        }, context: import("./types").Context) => Promise<{
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
        }, context: import("./types").Context) => Promise<{
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
        }, context: import("./types").Context) => Promise<{
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
        createSite: (_parent: any, { input }: {
            input: any;
        }, context: import("./types").Context) => Promise<{
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
            description: string | null;
            latitude: number;
            longitude: number;
            altitude: number | null;
        }>;
        updateSite: (_parent: any, { id, input }: {
            id: string;
            input: any;
        }, context: import("./types").Context) => Promise<{
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
            description: string | null;
            latitude: number;
            longitude: number;
            altitude: number | null;
        }>;
        deleteSite: (_parent: any, { id }: {
            id: string;
        }, context: import("./types").Context) => Promise<boolean>;
        createOrganization: (_parent: any, { input }: {
            input: any;
        }, context: import("./types").Context) => Promise<{
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
        }, context: import("./types").Context) => Promise<{
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
        }, context: import("./types").Context) => Promise<boolean>;
        addUserToOrganization: (_parent: any, { userId, organizationId, role }: {
            userId: string;
            organizationId: string;
            role: string;
        }, context: import("./types").Context) => Promise<{
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
        }, context: import("./types").Context) => Promise<boolean>;
        updateOrganizationMemberRole: (_parent: any, { userId, organizationId, role }: {
            userId: string;
            organizationId: string;
            role: string;
        }, context: import("./types").Context) => Promise<{
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
        createUser: (_parent: any, { input }: {
            input: any;
        }, context: import("./types").Context) => Promise<{
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
        }, context: import("./types").Context) => Promise<{
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
        }, context: import("./types").Context) => Promise<boolean>;
        toggleUserStatus: (_parent: any, { id }: {
            id: string;
        }, context: import("./types").Context) => Promise<{
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
        register: (_parent: any, { email, password, firstName, lastName }: any, context: import("./types").Context) => Promise<{
            token: string;
            user: {
                organizations: any[];
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
        }>;
        login: (_parent: any, { email, password }: {
            email: string;
            password: string;
        }, context: import("./types").Context) => Promise<{
            token: string;
            user: {
                organizations: any[];
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
        }>;
        changePassword: (_parent: any, { currentPassword, newPassword }: {
            currentPassword: string;
            newPassword: string;
        }, context: import("./types").Context) => Promise<boolean>;
    };
    User: {
        organizationMemberships: (parent: any, _args: any, context: import("./types").Context) => Promise<({
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
        createdMissions: (parent: any, _args: any, context: import("./types").Context) => Promise<({
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
        assignedMissions: (parent: any, _args: any, context: import("./types").Context) => Promise<({
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
    Organization: {
        members: (parent: any, _args: any, context: import("./types").Context) => Promise<({
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
        sites: (parent: any, _args: any, context: import("./types").Context) => Promise<{
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
        drones: (parent: any, _args: any, context: import("./types").Context) => Promise<{
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
        missions: (parent: any, _args: any, context: import("./types").Context) => Promise<{
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
        stats: (parent: any, _args: any, context: import("./types").Context) => Promise<{
            totalDrones: number;
            activeDrones: number;
            totalMissions: number;
            completedMissions: number;
            totalSites: number;
            totalFlightHours: number;
            averageMissionDuration: number;
        }>;
    };
    Site: {
        organization: (parent: any, _args: any, context: import("./types").Context) => Promise<{
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        } | null>;
        missions: (parent: any, _args: any, context: import("./types").Context) => Promise<({
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
    Drone: {
        organization: (parent: any, _args: any, context: import("./types").Context) => Promise<{
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        } | null>;
        missions: (parent: any, _args: any, context: import("./types").Context) => Promise<({
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
        flightLogs: (parent: any, _args: any, context: import("./types").Context) => Promise<{
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
    Mission: {
        createdBy: (parent: any, _args: any, context: import("./types").Context) => Promise<{
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
        } | null>;
        assignedTo: (parent: any, _args: any, context: import("./types").Context) => Promise<{
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
        } | null>;
        drone: (parent: any, _args: any, context: import("./types").Context) => Promise<{
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
        site: (parent: any, _args: any, context: import("./types").Context) => Promise<{
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
        } | null>;
        organization: (parent: any, _args: any, context: import("./types").Context) => Promise<{
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        } | null>;
        waypoints: (parent: any, _args: any, context: import("./types").Context) => Promise<{
            id: string;
            latitude: number;
            longitude: number;
            altitude: number;
            sequence: number;
            missionId: string;
            action: string | null;
            parameters: import("@prisma/client/runtime/library").JsonValue | null;
        }[]>;
        flightLogs: (parent: any, _args: any, context: import("./types").Context) => Promise<{
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
        surveyData: (parent: any, _args: any, context: import("./types").Context) => Promise<{
            id: string;
            latitude: number;
            longitude: number;
            altitude: number;
            capturedAt: Date;
            missionId: string;
            dataType: string;
            fileUrl: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[]>;
        progress: (parent: any, _args: any, context: import("./types").Context) => Promise<number>;
    };
    Waypoint: {
        mission: (parent: any, _args: any, context: import("./types").Context) => Promise<{
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
    };
    FlightLog: {
        mission: (parent: any, _args: any, context: import("./types").Context) => Promise<{
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
        drone: (parent: any, _args: any, context: import("./types").Context) => Promise<{
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