# Drone Management System

A comprehensive drone management system for mission planning, fleet management, and analytics. This system provides a complete solution for managing drone operations, including mission planning, real-time monitoring, and comprehensive reporting.

## Features

### 🚁 Mission Planning and Configuration
- Define survey areas and flight paths
- Configure flight patterns (crosshatch, perimeter, waypoint, grid, spiral)
- Set data collection parameters (frequency, sensors, overlap percentage)
- Mission scheduling and priority management

### 🛩️ Fleet Visualization and Management
- Organization-wide drone inventory management
- Real-time drone status monitoring (available, in-mission, maintenance, charging, offline)
- Battery level and vital statistics tracking
- Drone specifications and capabilities management

### 📊 Real-time Mission Monitoring
- Visualize real-time drone flight paths on maps
- Mission progress tracking (% complete, estimated time remaining)
- Mission status updates (starting, in progress, completed, aborted)
- Mission control actions (pause, resume, abort)

### 📈 Survey Reporting and Analytics
- Comprehensive survey summaries and statistics
- Individual flight statistics (duration, distance, coverage)
- Organization-wide survey analytics
- Drone utilization reports and performance metrics

## Technology Stack

- **Backend**: Node.js with TypeScript
- **GraphQL API**: Apollo Server with Express
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session management and caching
- **Authentication**: JWT-based authentication with role-based access control
- **Logging**: Winston for structured logging

## Project Structure

```
src/
├── graphql/
│   ├── typeDefs.ts          # GraphQL schema definitions
│   └── resolvers/
│       ├── index.ts         # Main resolver index
│       ├── types.ts         # TypeScript types and interfaces
│       ├── auth/            # Authentication resolvers
│       ├── users/           # User management resolvers
│       ├── organizations/   # Organization management resolvers
│       ├── sites/           # Site management resolvers
│       ├── drones/          # Drone fleet management resolvers
│       ├── missions/        # Mission planning and execution resolvers
│       ├── waypoints/       # Waypoint management resolvers
│       ├── flightLog/       # Flight data logging resolvers
│       └── analytics/       # Analytics and reporting resolvers
├── middleware/
│   └── auth.ts             # Authentication middleware
├── utils/
│   ├── logger.ts           # Logging utility
│   ├── redis.ts            # Redis connection utility
│   └── rbac.ts             # Role-based access control utilities
└── server.ts               # Main server entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis server
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd drone-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Configure the following environment variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/drone_management"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed the database with initial data
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

The GraphQL API will be available at `http://localhost:4000/graphql`

## API Documentation

### Authentication

The system uses JWT-based authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Key GraphQL Operations

#### Users and Authentication
- `login(email, password)` - User authentication
- `register(email, password, firstName, lastName)` - User registration
- `me` - Get current user information

#### Organizations
- `organizations` - List all organizations
- `createOrganization(input)` - Create new organization
- `addUserToOrganization(userId, organizationId, role)` - Add user to organization

#### Sites
- `sites(organizationId)` - List sites for an organization
- `createSite(input)` - Create new site
- `updateSite(id, input)` - Update site information

#### Drones
- `drones(organizationId)` - List drones for an organization
- `availableDrones(organizationId)` - List available drones
- `createDrone(input)` - Add new drone to fleet
- `updateDroneStatus(id, status)` - Update drone status

#### Missions
- `missions(organizationId, status)` - List missions
- `createMission(input)` - Create new mission
- `startMission(id)` - Start mission execution
- `pauseMission(id)` - Pause mission
- `resumeMission(id)` - Resume paused mission
- `abortMission(id)` - Abort mission
- `completeMission(id)` - Mark mission as completed

#### Analytics
- `organizationStats(organizationId)` - Get organization statistics
- `missionStats(organizationId, timeRange)` - Get mission statistics
- `droneUtilization(organizationId)` - Get drone utilization data

## Role-Based Access Control

The system implements a hierarchical role-based access control system:

- **SUPER_ADMIN**: Full system access, can manage all organizations
- **MODERATOR**: Organization management, user management, mission planning
- **OPERATOR**: Mission execution, drone control, flight operations
- **VIEWER**: Read-only access to organization data and analytics

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Code Style

The project uses ESLint with TypeScript rules. Run `npm run lint:fix` to automatically fix formatting issues.

## Deployment

### Production Build

1. Build the project:
```bash
npm run build
```

2. Set environment variables for production:
```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
REDIS_HOST=your-production-redis-host
JWT_SECRET=your-production-jwt-secret
```

3. Start the production server:
```bash
npm start
```

### Docker Deployment

A Dockerfile is provided for containerized deployment:

```bash
docker build -t drone-management-system .
docker run -p 4000:4000 drone-management-system
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository. 