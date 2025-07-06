"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const graphql_scalars_1 = require("graphql-scalars");
const auth_1 = require("./auth/auth");
const user_1 = require("./users/user");
const organization_1 = require("./organizations/organization");
const mission_1 = require("./missions/mission");
const index_1 = require("./site/index");
const index_2 = require("./drone/index");
const index_3 = require("./waypoint/index");
const index_4 = require("./flightLog/index");
const index_5 = require("./analytics/index");
exports.resolvers = {
    DateTime: graphql_scalars_1.DateTimeResolver,
    JSON: graphql_scalars_1.JSONResolver,
    Query: {
        ...auth_1.authResolvers.Query,
        ...user_1.userResolvers.Query,
        ...organization_1.organizationResolvers.Query,
        ...index_1.siteResolvers.Query,
        ...index_2.droneResolvers.Query,
        ...mission_1.missionResolvers.Query,
        ...index_3.waypointResolvers.Query,
        ...index_4.flightLogResolvers.Query,
        ...index_5.analyticsResolvers.Query,
    },
    Mutation: {
        ...auth_1.authResolvers.Mutation,
        ...user_1.userResolvers.Mutation,
        ...organization_1.organizationResolvers.Mutation,
        ...index_1.siteResolvers.Mutation,
        ...index_2.droneResolvers.Mutation,
        ...mission_1.missionResolvers.Mutation,
        ...index_3.waypointResolvers.Mutation,
        ...index_4.flightLogResolvers.Mutation,
    },
    User: user_1.userResolvers.User,
    Organization: organization_1.organizationResolvers.Organization,
    Site: index_1.siteResolvers.Site,
    Drone: index_2.droneResolvers.Drone,
    Mission: mission_1.missionResolvers.Mission,
    Waypoint: index_3.waypointResolvers.Waypoint,
    FlightLog: index_4.flightLogResolvers.FlightLog,
};
//# sourceMappingURL=index.js.map