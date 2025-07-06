# Falcon Drone Management System - GraphQL API Documentation

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Organization Management](#organization-management)
5. [Site Management](#site-management)
6. [Drone Management](#drone-management)
7. [Mission Management](#mission-management)
8. [Waypoint Management](#waypoint-management)
9. [Flight Log Management](#flight-log-management)
10. [Analytics](#analytics)
11. [Error Handling](#error-handling)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Redis server running (for caching)

### Environment Variables
Create a `.env` file with the following variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/falcon_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
PORT=4000
```

### Starting the Server
```bash
# Install dependencies
yarn install

# Generate Prisma client
yarn prisma generate

# Run database migrations
yarn prisma migrate dev

# Seed the database
yarn seed

# Start development server
yarn dev
```

The GraphQL endpoint will be available at: `http://localhost:4000/graphql`

## Authentication

### Headers Required
For authenticated requests, include the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication Flow

#### 1. Register a New User
```graphql
mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
  register(email: $email, password: $password, firstName: $firstName, lastName: $lastName) {
    token
    user {
      id
      email
      firstName
      lastName
      role
      organizations {
        id
        name
        userRole
      }
    }
  }
}
```

**Variables:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### 2. Login
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      email
      firstName
      lastName
      role
      organizations {
        id
        name
        userRole
      }
    }
  }
}
```

**Variables:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 3. Get Current User
```graphql
query Me {
  me {
    id
    email
    firstName
    lastName
    role
    organizations {
      id
      name
      userRole
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

#### 4. Change Password
```graphql
mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
  changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

## User Management

### Get All Users
```graphql
query Users($organizationId: String!) {
  users(organizationId: $organizationId) {
    id
    email
    firstName
    lastName
    role
    isActive
    lastLogin
    createdAt
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`

### Get Single User
```graphql
query User($id: String!) {
  user(id: $id) {
    id
    email
    firstName
    lastName
    role
    isActive
    lastLogin
    createdAt
    organizationMemberships {
      organization {
        id
        name
      }
      role
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Create User
```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    email
    firstName
    lastName
    role
    isActive
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`

**Input:**
```json
{
  "input": {
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "OPERATOR",
    "organizationId": "org-id"
  }
}
```

### Update User
```graphql
mutation UpdateUser($id: String!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    email
    firstName
    lastName
    role
    isActive
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`

### Delete User
```graphql
mutation DeleteUser($id: String!) {
  deleteUser(id: $id)
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`

## Organization Management

### Get All Organizations
```graphql
query Organizations {
  organizations {
    id
    name
    description
    isActive
    createdAt
    memberCount
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`

### Get Single Organization
```graphql
query Organization($id: String!) {
  organization(id: $id) {
    id
    name
    description
    isActive
    createdAt
    members {
      user {
        id
        email
        firstName
        lastName
      }
      role
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Get My Organizations
```graphql
query MyOrganizations {
  myOrganizations {
    id
    name
    description
    userRole
    memberCount
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Create Organization
```graphql
mutation CreateOrganization($input: CreateOrganizationInput!) {
  createOrganization(input: $input) {
    id
    name
    description
    isActive
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`

### Update Organization
```graphql
mutation UpdateOrganization($id: String!, $input: UpdateOrganizationInput!) {
  updateOrganization(id: $id, input: $input) {
    id
    name
    description
    isActive
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`

### Delete Organization
```graphql
mutation DeleteOrganization($id: String!) {
  deleteOrganization(id: $id)
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`

## Site Management

### Get All Sites
```graphql
query Sites($organizationId: String!) {
  sites(organizationId: $organizationId) {
    id
    name
    description
    latitude
    longitude
    altitude
    isActive
    createdAt
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Get Single Site
```graphql
query Site($id: String!) {
  site(id: $id) {
    id
    name
    description
    latitude
    longitude
    altitude
    isActive
    createdAt
    organization {
      id
      name
    }
    missions {
      id
      name
      status
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Create Site
```graphql
mutation CreateSite($input: CreateSiteInput!) {
  createSite(input: $input) {
    id
    name
    description
    latitude
    longitude
    altitude
    isActive
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

**Input:**
```json
{
  "input": {
    "name": "Downtown Office Complex",
    "description": "High-rise office buildings in downtown area",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "altitude": 10,
    "organizationId": "org-id"
  }
}
```

### Update Site
```graphql
mutation UpdateSite($id: String!, $input: UpdateSiteInput!) {
  updateSite(id: $id, input: $input) {
    id
    name
    description
    latitude
    longitude
    altitude
    isActive
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

### Delete Site
```graphql
mutation DeleteSite($id: String!) {
  deleteSite(id: $id)
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`

## Drone Management

### Get All Drones
```graphql
query Drones($organizationId: String!) {
  drones(organizationId: $organizationId) {
    id
    name
    model
    serialNumber
    status
    batteryLevel
    maxFlightTime
    maxSpeed
    maxAltitude
    cameraResolution
    sensorTypes
    isActive
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Get Single Drone
```graphql
query Drone($id: String!) {
  drone(id: $id) {
    id
    name
    model
    serialNumber
    status
    batteryLevel
    maxFlightTime
    maxSpeed
    maxAltitude
    cameraResolution
    sensorTypes
    isActive
    organization {
      id
      name
    }
    missions {
      id
      name
      status
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Get Available Drones
```graphql
query AvailableDrones($organizationId: String!) {
  availableDrones(organizationId: $organizationId) {
    id
    name
    model
    serialNumber
    batteryLevel
    maxFlightTime
    maxSpeed
    maxAltitude
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Create Drone
```graphql
mutation CreateDrone($input: CreateDroneInput!) {
  createDrone(input: $input) {
    id
    name
    model
    serialNumber
    status
    batteryLevel
    maxFlightTime
    maxSpeed
    maxAltitude
    cameraResolution
    sensorTypes
    isActive
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

**Input:**
```json
{
  "input": {
    "name": "DJI Phantom 4 Pro",
    "model": "Phantom 4 Pro",
    "serialNumber": "P4P-001-2024",
    "maxFlightTime": 30,
    "maxSpeed": 20.0,
    "maxAltitude": 120.0,
    "cameraResolution": "4K",
    "sensorTypes": ["RGB_CAMERA", "GPS", "IMU"],
    "organizationId": "org-id"
  }
}
```

### Update Drone
```graphql
mutation UpdateDrone($id: String!, $input: UpdateDroneInput!) {
  updateDrone(id: $id, input: $input) {
    id
    name
    model
    serialNumber
    status
    batteryLevel
    maxFlightTime
    maxSpeed
    maxAltitude
    cameraResolution
    sensorTypes
    isActive
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

### Delete Drone
```graphql
mutation DeleteDrone($id: String!) {
  deleteDrone(id: $id)
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`

## Mission Management

### Get All Missions
```graphql
query Missions($organizationId: String!, $status: String) {
  missions(organizationId: $organizationId, status: $status) {
    id
    name
    description
    type
    status
    priority
    flightPattern
    plannedAltitude
    plannedSpeed
    overlapPercentage
    scheduledAt
    estimatedDuration
    progress
    createdAt
    drone {
      id
      name
      model
    }
    site {
      id
      name
    }
    createdBy {
      id
      firstName
      lastName
    }
    assignedTo {
      id
      firstName
      lastName
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Get Single Mission
```graphql
query Mission($id: String!) {
  mission(id: $id) {
    id
    name
    description
    type
    status
    priority
    flightPattern
    plannedAltitude
    plannedSpeed
    overlapPercentage
    scheduledAt
    estimatedDuration
    startedAt
    completedAt
    progress
    createdAt
    drone {
      id
      name
      model
      status
    }
    site {
      id
      name
      latitude
      longitude
    }
    createdBy {
      id
      firstName
      lastName
    }
    assignedTo {
      id
      firstName
      lastName
    }
    waypoints {
      id
      sequence
      latitude
      longitude
      altitude
      action
      parameters
    }
    flightLogs {
      id
      timestamp
      latitude
      longitude
      altitude
      speed
      batteryLevel
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Get My Missions
```graphql
query MyMissions {
  myMissions {
    id
    name
    description
    type
    status
    priority
    progress
    createdAt
    drone {
      id
      name
      model
    }
    site {
      id
      name
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Get Active Missions
```graphql
query ActiveMissions($organizationId: String!) {
  activeMissions(organizationId: $organizationId) {
    id
    name
    description
    type
    status
    priority
    progress
    startedAt
    drone {
      id
      name
      model
    }
    site {
      id
      name
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Create Mission
```graphql
mutation CreateMission($input: CreateMissionInput!) {
  createMission(input: $input) {
    id
    name
    description
    type
    status
    priority
    flightPattern
    plannedAltitude
    plannedSpeed
    overlapPercentage
    scheduledAt
    estimatedDuration
    drone {
      id
      name
      model
    }
    site {
      id
      name
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

**Input:**
```json
{
  "input": {
    "name": "Downtown Building Inspection",
    "description": "Routine inspection of downtown office buildings",
    "type": "INSPECTION",
    "priority": 3,
    "flightPattern": "PERIMETER",
    "plannedAltitude": 50.0,
    "plannedSpeed": 5.0,
    "overlapPercentage": 70,
    "scheduledAt": "2024-01-15T10:00:00Z",
    "estimatedDuration": 45,
    "droneId": "drone-id",
    "siteId": "site-id",
    "organizationId": "org-id",
    "waypoints": [
      {
        "sequence": 1,
        "latitude": 40.7128,
        "longitude": -74.0060,
        "altitude": 50.0,
        "action": "takeoff"
      }
    ]
  }
}
```

### Update Mission
```graphql
mutation UpdateMission($id: String!, $input: UpdateMissionInput!) {
  updateMission(id: $id, input: $input) {
    id
    name
    description
    type
    status
    priority
    flightPattern
    plannedAltitude
    plannedSpeed
    overlapPercentage
    scheduledAt
    estimatedDuration
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

### Delete Mission
```graphql
mutation DeleteMission($id: String!) {
  deleteMission(id: $id)
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`

### Mission Control Operations

#### Start Mission
```graphql
mutation StartMission($id: String!) {
  startMission(id: $id) {
    id
    name
    status
    startedAt
    drone {
      id
      name
      status
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

#### Pause Mission
```graphql
mutation PauseMission($id: String!) {
  pauseMission(id: $id) {
    id
    name
    status
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

#### Resume Mission
```graphql
mutation ResumeMission($id: String!) {
  resumeMission(id: $id) {
    id
    name
    status
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

#### Abort Mission
```graphql
mutation AbortMission($id: String!) {
  abortMission(id: $id) {
    id
    name
    status
    drone {
      id
      name
      status
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

#### Complete Mission
```graphql
mutation CompleteMission($id: String!) {
  completeMission(id: $id) {
    id
    name
    status
    completedAt
    drone {
      id
      name
      status
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

#### Assign Mission
```graphql
mutation AssignMission($id: String!, $userId: String!) {
  assignMission(id: $id, userId: $userId) {
    id
    name
    assignedTo {
      id
      firstName
      lastName
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`

## Waypoint Management

### Get Waypoints for Mission
```graphql
query Waypoints($missionId: String!) {
  waypoints(missionId: $missionId) {
    id
    sequence
    latitude
    longitude
    altitude
    action
    parameters
    mission {
      id
      name
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Get Single Waypoint
```graphql
query Waypoint($id: String!) {
  waypoint(id: $id) {
    id
    sequence
    latitude
    longitude
    altitude
    action
    parameters
    mission {
      id
      name
      status
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Create Waypoint
```graphql
mutation CreateWaypoint($input: CreateWaypointInput!) {
  createWaypoint(input: $input) {
    id
    sequence
    latitude
    longitude
    altitude
    action
    parameters
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

**Input:**
```json
{
  "input": {
    "missionId": "mission-id",
    "sequence": 1,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "altitude": 50.0,
    "action": "takeoff",
    "parameters": {}
  }
}
```

### Update Waypoint
```graphql
mutation UpdateWaypoint($id: String!, $input: UpdateWaypointInput!) {
  updateWaypoint(id: $id, input: $input) {
    id
    sequence
    latitude
    longitude
    altitude
    action
    parameters
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

### Delete Waypoint
```graphql
mutation DeleteWaypoint($id: String!) {
  deleteWaypoint(id: $id)
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`

## Flight Log Management

### Get Flight Logs
```graphql
query FlightLogs($missionId: String!, $limit: Int, $offset: Int) {
  flightLogs(missionId: $missionId, limit: $limit, offset: $offset) {
    id
    timestamp
    latitude
    longitude
    altitude
    speed
    batteryLevel
    gpsAccuracy
    heading
    mission {
      id
      name
    }
    drone {
      id
      name
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Get Single Flight Log
```graphql
query FlightLog($id: String!) {
  flightLog(id: $id) {
    id
    timestamp
    latitude
    longitude
    altitude
    speed
    batteryLevel
    gpsAccuracy
    heading
    mission {
      id
      name
      status
    }
    drone {
      id
      name
      model
    }
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

### Create Flight Log
```graphql
mutation CreateFlightLog($input: CreateFlightLogInput!) {
  createFlightLog(input: $input) {
    id
    timestamp
    latitude
    longitude
    altitude
    speed
    batteryLevel
    gpsAccuracy
    heading
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`, `OPERATOR`

**Input:**
```json
{
  "input": {
    "missionId": "mission-id",
    "droneId": "drone-id",
    "timestamp": "2024-01-15T10:30:00Z",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "altitude": 50.0,
    "speed": 5.0,
    "batteryLevel": 85,
    "gpsAccuracy": 2.5,
    "heading": 180.0
  }
}
```

## Analytics

### Organization Statistics
```graphql
query OrganizationStats($organizationId: String!, $period: String!) {
  organizationStats(organizationId: $organizationId, period: $period) {
    totalMissions
    completedMissions
    activeMissions
    totalFlightTime
    totalDistance
    averageMissionDuration
    missionSuccessRate
    droneUtilization
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`

### Mission Statistics
```graphql
query MissionStats($organizationId: String!, $period: String!) {
  missionStats(organizationId: $organizationId, period: $period) {
    totalMissions
    missionsByType {
      type
      count
      successRate
    }
    missionsByStatus {
      status
      count
    }
    averageDuration
    totalFlightTime
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`

### Drone Utilization
```graphql
query DroneUtilization($organizationId: String!, $period: String!) {
  droneUtilization(organizationId: $organizationId, period: $period) {
    droneId
    droneName
    totalMissions
    totalFlightTime
    utilizationRate
    averageBatteryUsage
    maintenanceAlerts
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`
**Roles Required:** `SUPER_ADMIN`, `MODERATOR`

### Real-time Flight Data
```graphql
query RealtimeFlightData($missionId: String!) {
  realtimeFlightData(missionId: $missionId) {
    timestamp
    latitude
    longitude
    altitude
    speed
    batteryLevel
    gpsAccuracy
    heading
    status
  }
}
```

**Headers Required:** `Authorization: Bearer YOUR_JWT_TOKEN`

## Error Handling

### Common Error Codes
- `UNAUTHENTICATED`: User not authenticated
- `FORBIDDEN`: User doesn't have required permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `INTERNAL_SERVER_ERROR`: Server error

### Error Response Format
```json
{
  "errors": [
    {
      "message": "Error description",
      "extensions": {
        "code": "ERROR_CODE",
        "field": "fieldName"
      }
    }
  ]
}
```

## User Roles and Permissions

### SUPER_ADMIN
- Full access to all operations
- Can manage users, organizations, and system settings
- Can delete any resource

### MODERATOR
- Can manage missions, drones, sites, and waypoints
- Can view analytics and reports
- Cannot delete organizations or users

### OPERATOR
- Can create and manage missions
- Can control mission execution (start, pause, resume, abort, complete)
- Can view assigned missions and flight logs
- Cannot manage users or organizations

### VIEWER
- Read-only access to missions, drones, sites
- Can view analytics and reports
- Cannot perform any write operations

## Testing with Apollo Studio

1. **Start your server**: `yarn dev`
2. **Go to Apollo Studio**: https://studio.apollographql.com/sandbox/explorer
3. **Enter endpoint**: `http://localhost:4000/graphql`
4. **Test authentication**:
   - First, register or login to get a token
   - Add the token to the "Headers" tab: `{"Authorization": "Bearer YOUR_TOKEN"}`
5. **Test queries and mutations** using the examples above

## Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!) { register(email: $email, password: $password, firstName: $firstName, lastName: $lastName) { token user { id email firstName lastName role } } }",
    "variables": {
      "email": "test@example.com",
      "password": "password123",
      "firstName": "Test",
      "lastName": "User"
    }
  }'
```

### Login:
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { token user { id email firstName lastName role } } }",
    "variables": {
      "email": "test@example.com",
      "password": "password123"
    }
  }'
```

### Get missions (with token):
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "query Missions($organizationId: String!) { missions(organizationId: $organizationId) { id name description type status priority } }",
    "variables": {
      "organizationId": "your-org-id"
    }
  }'
```

## Pre-seeded Data

After running `yarn seed`, the following test data is available:

### Test Users:
- **Super Admin**: `admin@falcon.com` / `admin123`
- **Operator**: `operator@falcon.com` / `password123`
- **Moderator**: `moderator@falcon.com` / `password123`
- **Viewer**: `viewer@falcon.com` / `password123`

### Test Organization:
- **Falcon Drone Services** (ID: `falcon-drone-services`)

### Test Sites:
- Downtown Office Complex
- Industrial Warehouse
- Construction Site A

### Test Drones:
- DJI Phantom 4 Pro
- DJI Mavic 2 Enterprise
- Autel EVO II

### Test Missions:
- Downtown Building Inspection
- Warehouse Security Patrol
- Construction Site Mapping

Use these credentials to test the API without creating new data. 