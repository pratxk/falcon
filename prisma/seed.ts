import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a super admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@falcon.com' },
    update: {},
    create: {
      email: 'admin@falcon.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Created super admin user:', superAdmin.email);

  // Create a test organization
  const organization = await prisma.organization.upsert({
    where: { id: 'falcon-drone-services' },
    update: {},
    create: {
      name: 'Falcon Drone Services',
      description: 'Professional drone services for inspection, mapping, and surveillance',
      isActive: true,
    },
  });

  console.log('✅ Created organization:', organization.name);

  // Add super admin to organization
  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: superAdmin.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      organizationId: organization.id,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Added super admin to organization');

  // Create test users
  const testUsers = [
    {
      email: 'operator@falcon.com',
      firstName: 'John',
      lastName: 'Operator',
      role: 'OPERATOR' as const,
    },
    {
      email: 'moderator@falcon.com',
      firstName: 'Sarah',
      lastName: 'Moderator',
      role: 'MODERATOR' as const,
    },
    {
      email: 'viewer@falcon.com',
      firstName: 'Mike',
      lastName: 'Viewer',
      role: 'VIEWER' as const,
    },
  ];

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: await bcrypt.hash('password123', 12),
        isActive: true,
      },
    });

    // Add user to organization
    await prisma.organizationMember.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: organization.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        organizationId: organization.id,
        role: userData.role,
      },
    });

    console.log(`✅ Created ${userData.role} user:`, user.email);
  }

  // Create test sites
  const sites = [
    {
      name: 'Downtown Office Complex',
      description: 'High-rise office buildings in downtown area',
      latitude: 40.7128,
      longitude: -74.0060,
      altitude: 10,
    },
    {
      name: 'Industrial Warehouse',
      description: 'Large industrial warehouse facility',
      latitude: 40.7589,
      longitude: -73.9851,
      altitude: 5,
    },
    {
      name: 'Construction Site A',
      description: 'Active construction site for new residential complex',
      latitude: 40.7505,
      longitude: -73.9934,
      altitude: 0,
    },
  ];

  for (const siteData of sites) {
    const site = await prisma.site.upsert({
      where: { id: siteData.name },
      update: {},
      create: {
        ...siteData,
        organizationId: organization.id,
        isActive: true,
      },
    });

    console.log('✅ Created site:', site.name);
  }

  // Create test drones
  const drones = [
    {
      name: 'DJI Phantom 4 Pro',
      model: 'Phantom 4 Pro',
      serialNumber: 'P4P-001-2024',
      maxFlightTime: 30,
      maxSpeed: 20.0,
      maxAltitude: 120.0,
      cameraResolution: '4K',
      sensorTypes: ['RGB_CAMERA', 'GPS', 'IMU'],
    },
    {
      name: 'DJI Mavic 2 Enterprise',
      model: 'Mavic 2 Enterprise',
      serialNumber: 'M2E-002-2024',
      maxFlightTime: 31,
      maxSpeed: 19.0,
      maxAltitude: 100.0,
      cameraResolution: '4K',
      sensorTypes: ['RGB_CAMERA', 'THERMAL_CAMERA', 'GPS', 'IMU'],
    },
    {
      name: 'Autel EVO II',
      model: 'EVO II 8K',
      serialNumber: 'EVO2-003-2024',
      maxFlightTime: 40,
      maxSpeed: 22.0,
      maxAltitude: 150.0,
      cameraResolution: '8K',
      sensorTypes: ['RGB_CAMERA', 'GPS', 'IMU', 'BAROMETER'],
    },
  ];

  for (const droneData of drones) {
    const drone = await prisma.drone.upsert({
      where: { serialNumber: droneData.serialNumber },
      update: {},
      create: {
        ...droneData,
        organizationId: organization.id,
        status: 'AVAILABLE',
        batteryLevel: 100,
        isActive: true,
      },
    });

    console.log('✅ Created drone:', drone.name);
  }

  // Create test missions
  const missions = [
    {
      name: 'Downtown Building Inspection',
      description: 'Routine inspection of downtown office buildings',
      type: 'INSPECTION' as const,
      priority: 3,
      flightPattern: 'PERIMETER' as const,
      plannedAltitude: 50.0,
      plannedSpeed: 5.0,
      overlapPercentage: 70,
      estimatedDuration: 45,
    },
    {
      name: 'Warehouse Security Patrol',
      description: 'Night security patrol of industrial warehouse',
      type: 'SECURITY_PATROL' as const,
      priority: 2,
      flightPattern: 'GRID' as const,
      plannedAltitude: 30.0,
      plannedSpeed: 8.0,
      overlapPercentage: 60,
      estimatedDuration: 30,
    },
    {
      name: 'Construction Site Mapping',
      description: '3D mapping of construction site progress',
      type: 'SITE_MAPPING' as const,
      priority: 4,
      flightPattern: 'CROSSHATCH' as const,
      plannedAltitude: 80.0,
      plannedSpeed: 6.0,
      overlapPercentage: 80,
      estimatedDuration: 60,
    },
  ];

  const createdSites = await prisma.site.findMany({
    where: { organizationId: organization.id },
  });

  const createdDrones = await prisma.drone.findMany({
    where: { organizationId: organization.id },
  });

  for (let i = 0; i < missions.length; i++) {
    const missionData = missions[i]!; // Assert that missionData is not undefined
    const site = createdSites[i % createdSites.length];
    const drone = createdDrones[i % createdDrones.length];

    if (!missionData || !site || !drone) {
      console.log('⚠️ Skipping mission creation - missing mission data, site, or drone');
      continue;
    }

    const mission = await prisma.mission.upsert({
      where: { id: missionData.name },
      update: {},
      create: {
        name: missionData.name,
        description: missionData.description,
        type: missionData.type,
        priority: missionData.priority,
        flightPattern: missionData.flightPattern,
        plannedAltitude: missionData.plannedAltitude,
        plannedSpeed: missionData.plannedSpeed,
        overlapPercentage: missionData.overlapPercentage,
        estimatedDuration: missionData.estimatedDuration,
        createdById: superAdmin.id,
        assignedToId: superAdmin.id,
        droneId: drone.id,
        siteId: site.id,
        organizationId: organization.id,
        status: 'PLANNED',
        isActive: true,
      },
    });

    console.log('✅ Created mission:', mission.name);

    // Create waypoints for the mission
    const waypoints = [
      {
        sequence: 1,
        latitude: site.latitude + 0.001,
        longitude: site.longitude + 0.001,
        altitude: missionData.plannedAltitude,
        action: 'takeoff' as const,
      },
      {
        sequence: 2,
        latitude: site.latitude + 0.002,
        longitude: site.longitude + 0.002,
        altitude: missionData.plannedAltitude,
        action: 'hover' as const,
      },
      {
        sequence: 3,
        latitude: site.latitude + 0.003,
        longitude: site.longitude + 0.003,
        altitude: missionData.plannedAltitude,
        action: 'capture' as const,
      },
      {
        sequence: 4,
        latitude: site.latitude,
        longitude: site.longitude,
        altitude: 10,
        action: 'land' as const,
      },
    ];

    for (const waypointData of waypoints) {
      await prisma.waypoint.upsert({
        where: {
          missionId_sequence: {
            missionId: mission.id,
            sequence: waypointData.sequence,
          },
        },
        update: {},
        create: {
          ...waypointData,
          missionId: mission.id,
          parameters: {},
        },
      });
    }

    console.log(`✅ Created ${waypoints.length} waypoints for mission:`, mission.name);
  }

  // Create some sample flight logs
  const sampleMission = await prisma.mission.findFirst({
    where: { organizationId: organization.id },
  });

  if (sampleMission) {
    const flightLogs = [
      {
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        latitude: 40.7128,
        longitude: -74.0060,
        altitude: 50.0,
        speed: 5.0,
        batteryLevel: 85,
        gpsAccuracy: 2.5,
        heading: 180.0,
      },
      {
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        latitude: 40.7130,
        longitude: -74.0062,
        altitude: 50.0,
        speed: 5.5,
        batteryLevel: 75,
        gpsAccuracy: 2.1,
        heading: 185.0,
      },
      {
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        latitude: 40.7132,
        longitude: -74.0064,
        altitude: 50.0,
        speed: 6.0,
        batteryLevel: 65,
        gpsAccuracy: 1.8,
        heading: 190.0,
      },
    ];

    for (const logData of flightLogs) {
      await prisma.flightLog.create({
        data: {
          ...logData,
          missionId: sampleMission.id,
          droneId: sampleMission.droneId,
        },
      });
    }

    console.log(`✅ Created ${flightLogs.length} sample flight logs`);
  }

  // Create system settings
  const systemSettings = [
    {
      key: 'default_flight_altitude',
      value: '50',
      description: 'Default flight altitude in meters',
    },
    {
      key: 'max_mission_duration',
      value: '120',
      description: 'Maximum mission duration in minutes',
    },
    {
      key: 'battery_warning_threshold',
      value: '20',
      description: 'Battery level warning threshold percentage',
    },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Created system settings');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Super Admin: admin@falcon.com / admin123');
  console.log('Operator: operator@falcon.com / password123');
  console.log('Moderator: moderator@falcon.com / password123');
  console.log('Viewer: viewer@falcon.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 