import { Context } from '../types';
export declare const waypointResolvers: {
    Query: {};
    Mutation: {
        addWaypoint: (_parent: any, { missionId, input }: {
            missionId: string;
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
        }, context: Context) => Promise<boolean>;
        reorderWaypoints: (_parent: any, { missionId, waypointIds }: {
            missionId: string;
            waypointIds: string[];
        }, context: Context) => Promise<({
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
    };
    Waypoint: {
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
    };
};
//# sourceMappingURL=index.d.ts.map