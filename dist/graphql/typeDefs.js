"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.typeDefs = (0, graphql_tag_1.gql) `
  scalar DateTime
  scalar JSON

  enum Role {
    SUPER_ADMIN
    MODERATOR
    OPERATOR
    VIEWER
  }

  enum DroneStatus {
    AVAILABLE
    IN_MISSION
    MAINTENANCE
    CHARGING
    OFFLINE
  }

  enum MissionStatus {
    PLANNED
    IN_PROGRESS
    COMPLETED
    ABORTED
    FAILED
  }

  enum MissionType {
    INSPECTION
    SECURITY_PATROL
    SITE_MAPPING
    SURVEY
  }

  enum FlightPattern {
    CROSSHATCH
    PERIMETER
    WAYPOINT
    GRID
    SPIRAL
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: Role!
    isActive: Boolean!
    lastLogin: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    organizationMemberships: [OrganizationMember!]!
    createdMissions: [Mission!]!
    assignedMissions: [Mission!]!
  }

  type Organization {
    id: ID!
    name: String!
    description: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    members: [OrganizationMember!]!
    sites: [Site!]!
    drones: [Drone!]!
    missions: [Mission!]!
    stats: OrganizationStats!
  }

  type OrganizationMember {
    id: ID!
    user: User!
    organization: Organization!
    role: Role!
    joinedAt: DateTime!
  }

  type Site {
    id: ID!
    name: String!
    description: String
    latitude: Float!
    longitude: Float!
    altitude: Float
    organization: Organization!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    missions: [Mission!]!
  }

  type Drone {
    id: ID!
    name: String!
    model: String!
    serialNumber: String!
    status: DroneStatus!
    batteryLevel: Int!
    lastMaintenanceAt: DateTime
    organization: Organization!
    currentLatitude: Float
    currentLongitude: Float
    currentAltitude: Float
    isActive: Boolean!
    maxFlightTime: Int!
    maxSpeed: Float!
    maxAltitude: Float!
    cameraResolution: String
    sensorTypes: [String!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    missions: [Mission!]!
    flightLogs: [FlightLog!]!
  }

  type Mission {
    id: ID!
    name: String!
    description: String
    type: MissionType!
    status: MissionStatus!
    priority: Int!
    flightPattern: FlightPattern!
    plannedAltitude: Float!
    plannedSpeed: Float!
    overlapPercentage: Int!
    scheduledAt: DateTime
    startedAt: DateTime
    completedAt: DateTime
    estimatedDuration: Int
    createdBy: User!
    assignedTo: User
    drone: Drone!
    site: Site!
    organization: Organization!
    waypoints: [Waypoint!]!
    flightLogs: [FlightLog!]!
    surveyData: [SurveyData!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    progress: Float
  }

  type Waypoint {
    id: ID!
    mission: Mission!
    sequence: Int!
    latitude: Float!
    longitude: Float!
    altitude: Float!
    action: String
    parameters: JSON
  }

  type FlightLog {
    id: ID!
    mission: Mission!
    drone: Drone!
    timestamp: DateTime!
    latitude: Float!
    longitude: Float!
    altitude: Float!
    speed: Float!
    batteryLevel: Int!
    gpsAccuracy: Float
    heading: Float
  }

  type SurveyData {
    id: ID!
    mission: Mission!
    dataType: String!
    fileUrl: String
    metadata: JSON
    capturedAt: DateTime!
    latitude: Float!
    longitude: Float!
    altitude: Float!
  }

  type OrganizationStats {
    totalDrones: Int!
    activeDrones: Int!
    totalMissions: Int!
    completedMissions: Int!
    totalSites: Int!
    totalFlightHours: Float!
    averageMissionDuration: Float!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    # Auth
    me: User

    # Users
    users(organizationId: ID): [User!]!
    user(id: ID!): User

    # Organizations
    organizations: [Organization!]!
    organization(id: ID!): Organization
    myOrganizations: [Organization!]!

    # Sites
    sites(organizationId: ID!): [Site!]!
    site(id: ID!): Site

    # Drones
    drones(organizationId: ID!): [Drone!]!
    drone(id: ID!): Drone
    availableDrones(organizationId: ID!): [Drone!]!

    # Missions
    missions(organizationId: ID!, status: MissionStatus): [Mission!]!
    mission(id: ID!): Mission
    myMissions: [Mission!]!
    activeMissions(organizationId: ID!): [Mission!]!

    # Analytics
    organizationStats(organizationId: ID!): OrganizationStats!
    missionStats(organizationId: ID!, timeRange: String): JSON!
    droneUtilization(organizationId: ID!): JSON!

    # Real-time data
    realtimeFlightData(missionId: ID!): [FlightLog!]!
  }

  type Mutation {
    # Auth
    login(email: String!, password: String!): AuthPayload!
    register(
      email: String!
      password: String!
      firstName: String!
      lastName: String!
    ): AuthPayload!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!

    # Users
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    toggleUserStatus(id: ID!): User!

    # Organizations
    createOrganization(input: CreateOrganizationInput!): Organization!
    updateOrganization(id: ID!, input: UpdateOrganizationInput!): Organization!
    deleteOrganization(id: ID!): Boolean!
    addUserToOrganization(userId: ID!, organizationId: ID!, role: Role!): OrganizationMember!
    removeUserFromOrganization(userId: ID!, organizationId: ID!): Boolean!
    updateOrganizationMemberRole(userId: ID!, organizationId: ID!, role: Role!): OrganizationMember!

    # Sites
    createSite(input: CreateSiteInput!): Site!
    updateSite(id: ID!, input: UpdateSiteInput!): Site!
    deleteSite(id: ID!): Boolean!

    # Drones
    createDrone(input: CreateDroneInput!): Drone!
    updateDrone(id: ID!, input: UpdateDroneInput!): Drone!
    deleteDrone(id: ID!): Boolean!
    updateDroneStatus(id: ID!, status: DroneStatus!): Drone!
    updateDroneLocation(id: ID!, latitude: Float!, longitude: Float!, altitude: Float!): Drone!
    updateDroneBattery(id: ID!, batteryLevel: Int!): Drone!

    # Missions
    createMission(input: CreateMissionInput!): Mission!
    updateMission(id: ID!, input: UpdateMissionInput!): Mission!
    deleteMission(id: ID!): Boolean!
    startMission(id: ID!): Mission!
    pauseMission(id: ID!): Mission!
    resumeMission(id: ID!): Mission!
    abortMission(id: ID!): Mission!
    completeMission(id: ID!): Mission!
    assignMission(id: ID!, userId: ID!): Mission!

    # Waypoints
    addWaypoint(missionId: ID!, input: WaypointInput!): Waypoint!
    updateWaypoint(id: ID!, input: WaypointInput!): Waypoint!
    deleteWaypoint(id: ID!): Boolean!
    reorderWaypoints(missionId: ID!, waypointIds: [ID!]!): [Waypoint!]!

    # Flight logs (usually automated)
    logFlightData(input: FlightLogInput!): FlightLog!
  }

  type Subscription {
    # Real-time updates
    missionUpdated(organizationId: ID!): Mission!
    droneStatusUpdated(organizationId: ID!): Drone!
    flightDataUpdated(missionId: ID!): FlightLog!
  }

  # Input types
  input CreateUserInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: Role!
  }

  input UpdateUserInput {
    email: String
    firstName: String
    lastName: String
    role: Role
  }

  input CreateOrganizationInput {
    name: String!
    description: String
  }

  input UpdateOrganizationInput {
    name: String
    description: String
  }

  input CreateSiteInput {
    name: String!
    description: String
    latitude: Float!
    longitude: Float!
    altitude: Float
    organizationId: ID!
  }

  input UpdateSiteInput {
    name: String
    description: String
    latitude: Float
    longitude: Float
    altitude: Float
  }

  input CreateDroneInput {
    name: String!
    model: String!
    isActive: Boolean!
    serialNumber: String!
    organizationId: ID!
    maxFlightTime: Int!
    maxSpeed: Float!
    maxAltitude: Float!
    cameraResolution: String
    sensorTypes: [String!]!
  }

  input UpdateDroneInput {
    name: String
    model: String
    maxFlightTime: Int
    maxSpeed: Float
    maxAltitude: Float
    cameraResolution: String
    sensorTypes: [String!]
  }

  input CreateMissionInput {
    name: String!
    description: String
    type: MissionType!
    priority: Int
    flightPattern: FlightPattern!
    plannedAltitude: Float!
    plannedSpeed: Float!
    overlapPercentage: Int
    scheduledAt: DateTime
    estimatedDuration: Int
    droneId: ID!
    siteId: ID!
    organizationId: ID!
    waypoints: [WaypointInput!]
  }

  input UpdateMissionInput {
    name: String
    description: String
    status: String
    type: MissionType
    priority: Int
    flightPattern: FlightPattern
    plannedAltitude: Float
    plannedSpeed: Float
    overlapPercentage: Int
    scheduledAt: DateTime
    estimatedDuration: Int
    droneId: ID
    siteId: ID
  }

  input WaypointInput {
    sequence: Int!
    latitude: Float!
    longitude: Float!
    altitude: Float!
    action: String
    parameters: JSON
  }

  input FlightLogInput {
    missionId: ID!
    droneId: ID!
    latitude: Float!
    longitude: Float!
    altitude: Float!
    speed: Float!
    batteryLevel: Int!
    gpsAccuracy: Float
    heading: Float
  }
`;
//# sourceMappingURL=typeDefs.js.map