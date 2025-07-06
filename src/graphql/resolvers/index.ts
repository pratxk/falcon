import { DateTimeResolver, JSONResolver } from 'graphql-scalars';
import { authResolvers } from './auth/auth';
import { userResolvers } from './users/user';
import { organizationResolvers } from './organizations/organization';
import { missionResolvers } from './missions/mission';
import { siteResolvers } from './site/index';
import { droneResolvers } from './drone/index';
import { waypointResolvers } from './waypoint/index';
import { flightLogResolvers } from './flightLog/index';
import { analyticsResolvers } from './analytics/index';

export const resolvers = {
  // Scalars
  DateTime: DateTimeResolver,
  JSON: JSONResolver,

  // Queries
  Query: {
    ...authResolvers.Query,
    ...userResolvers.Query,
    ...organizationResolvers.Query,
    ...siteResolvers.Query,
    ...droneResolvers.Query,
    ...missionResolvers.Query,
    ...waypointResolvers.Query,
    ...flightLogResolvers.Query,
    ...analyticsResolvers.Query,
  },

  // Mutations
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...organizationResolvers.Mutation,
    ...siteResolvers.Mutation,
    ...droneResolvers.Mutation,
    ...missionResolvers.Mutation,
    ...waypointResolvers.Mutation,
    ...flightLogResolvers.Mutation,
  },

  // Type resolvers
  User: userResolvers.User,
  Organization: organizationResolvers.Organization,
  Site: siteResolvers.Site,
  Drone: droneResolvers.Drone,
  Mission: missionResolvers.Mission,
  Waypoint: waypointResolvers.Waypoint,
  FlightLog: flightLogResolvers.FlightLog,
};