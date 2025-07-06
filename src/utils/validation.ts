import { GraphQLError } from 'graphql';

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns boolean indicating if password meets requirements
 */
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // Minimum 8 characters
  if (password.length < 8) {
    return false;
  }
  
  return true;
}

/**
 * Validates password with enhanced security requirements
 * @param password - Password to validate
 * @returns boolean indicating if password meets enhanced requirements
 */
export function validateStrongPassword(password: string): boolean {
  if (!validatePassword(password)) {
    return false;
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return false;
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return false;
  }
  
  return true;
}

/**
 * Validates latitude coordinate
 * @param latitude - Latitude value to validate
 * @returns boolean indicating if latitude is valid
 */
export function validateLatitude(latitude: number): boolean {
  if (typeof latitude !== 'number' || isNaN(latitude)) {
    return false;
  }
  
  return latitude >= -90 && latitude <= 90;
}

/**
 * Validates longitude coordinate
 * @param longitude - Longitude value to validate
 * @returns boolean indicating if longitude is valid
 */
export function validateLongitude(longitude: number): boolean {
  if (typeof longitude !== 'number' || isNaN(longitude)) {
    return false;
  }
  
  return longitude >= -180 && longitude <= 180;
}

/**
 * Validates altitude value
 * @param altitude - Altitude value to validate
 * @returns boolean indicating if altitude is valid
 */
export function validateAltitude(altitude: number): boolean {
  if (typeof altitude !== 'number' || isNaN(altitude)) {
    return false;
  }
  
  return altitude >= 0;
}

/**
 * Validates coordinates (latitude, longitude, altitude)
 * @param coordinates - Object containing lat, lng, and optional alt
 * @returns boolean indicating if coordinates are valid
 */
export function validateCoordinates(coordinates: {
  latitude: number;
  longitude: number;
  altitude?: number;
}): boolean {
  if (!coordinates || typeof coordinates !== 'object') {
    return false;
  }
  
  if (!validateLatitude(coordinates.latitude)) {
    return false;
  }
  
  if (!validateLongitude(coordinates.longitude)) {
    return false;
  }
  
  if (coordinates.altitude !== undefined && !validateAltitude(coordinates.altitude)) {
    return false;
  }
  
  return true;
}

/**
 * Validates battery level percentage
 * @param batteryLevel - Battery level to validate (0-100)
 * @returns boolean indicating if battery level is valid
 */
export function validateBatteryLevel(batteryLevel: number): boolean {
  if (typeof batteryLevel !== 'number' || isNaN(batteryLevel)) {
    return false;
  }
  
  return batteryLevel >= 0 && batteryLevel <= 100;
}

/**
 * Validates speed value
 * @param speed - Speed value to validate
 * @returns boolean indicating if speed is valid
 */
export function validateSpeed(speed: number): boolean {
  if (typeof speed !== 'number' || isNaN(speed)) {
    return false;
  }
  
  return speed >= 0;
}

/**
 * Validates GPS accuracy
 * @param accuracy - GPS accuracy to validate
 * @returns boolean indicating if GPS accuracy is valid
 */
export function validateGPSAccuracy(accuracy: number): boolean {
  if (typeof accuracy !== 'number' || isNaN(accuracy)) {
    return false;
  }
  
  return accuracy >= 0;
}

/**
 * Validates heading (compass direction)
 * @param heading - Heading value to validate (0-360 degrees)
 * @returns boolean indicating if heading is valid
 */
export function validateHeading(heading: number): boolean {
  if (typeof heading !== 'number' || isNaN(heading)) {
    return false;
  }
  
  return heading >= 0 && heading <= 360;
}

/**
 * Validates overlap percentage for survey missions
 * @param overlapPercentage - Overlap percentage to validate (0-100)
 * @returns boolean indicating if overlap percentage is valid
 */
export function validateOverlapPercentage(overlapPercentage: number): boolean {
  if (typeof overlapPercentage !== 'number' || isNaN(overlapPercentage)) {
    return false;
  }
  
  return overlapPercentage >= 0 && overlapPercentage <= 100;
}

/**
 * Validates mission priority
 * @param priority - Priority value to validate
 * @returns boolean indicating if priority is valid
 */
export function validateMissionPriority(priority: number): boolean {
  if (typeof priority !== 'number' || isNaN(priority)) {
    return false;
  }
  
  return priority >= 1 && priority <= 10;
}

/**
 * Validates drone specifications
 * @param specs - Drone specifications object
 * @returns boolean indicating if specifications are valid
 */
export function validateDroneSpecifications(specs: {
  maxFlightTime: number;
  maxSpeed: number;
  maxAltitude: number;
}): boolean {
  if (!specs || typeof specs !== 'object') {
    return false;
  }
  
  if (!specs.maxFlightTime || specs.maxFlightTime <= 0) {
    return false;
  }
  
  if (!specs.maxSpeed || specs.maxSpeed <= 0) {
    return false;
  }
  
  if (!specs.maxAltitude || specs.maxAltitude <= 0) {
    return false;
  }
  
  return true;
}

/**
 * Validates waypoint sequence number
 * @param sequence - Sequence number to validate
 * @returns boolean indicating if sequence is valid
 */
export function validateWaypointSequence(sequence: number): boolean {
  if (typeof sequence !== 'number' || isNaN(sequence)) {
    return false;
  }
  
  return sequence >= 1 && Number.isInteger(sequence);
}

/**
 * Validates UUID format
 * @param uuid - UUID string to validate
 * @returns boolean indicating if UUID is valid
 */
export function validateUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates date string or Date object
 * @param date - Date to validate
 * @returns boolean indicating if date is valid
 */
export function validateDate(date: string | Date): boolean {
  if (!date) {
    return false;
  }
  
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Validates string length
 * @param str - String to validate
 * @param minLength - Minimum length required
 * @param maxLength - Maximum length allowed
 * @returns boolean indicating if string length is valid
 */
export function validateStringLength(str: string, minLength: number, maxLength: number): boolean {
  if (typeof str !== 'string') {
    return false;
  }
  
  const length = str.trim().length;
  return length >= minLength && length <= maxLength;
}

/**
 * Validates organization name
 * @param name - Organization name to validate
 * @returns boolean indicating if name is valid
 */
export function validateOrganizationName(name: string): boolean {
  return validateStringLength(name, 2, 100);
}

/**
 * Validates site name
 * @param name - Site name to validate
 * @returns boolean indicating if name is valid
 */
export function validateSiteName(name: string): boolean {
  return validateStringLength(name, 2, 100);
}

/**
 * Validates drone name
 * @param name - Drone name to validate
 * @returns boolean indicating if name is valid
 */
export function validateDroneName(name: string): boolean {
  return validateStringLength(name, 2, 50);
}

/**
 * Validates mission name
 * @param name - Mission name to validate
 * @returns boolean indicating if name is valid
 */
export function validateMissionName(name: string): boolean {
  return validateStringLength(name, 2, 100);
}

/**
 * Validates user names
 * @param firstName - First name to validate
 * @param lastName - Last name to validate
 * @returns boolean indicating if names are valid
 */
export function validateUserNames(firstName: string, lastName: string): boolean {
  if (!validateStringLength(firstName, 1, 50)) {
    return false;
  }
  
  if (!validateStringLength(lastName, 1, 50)) {
    return false;
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(firstName) && nameRegex.test(lastName);
}

/**
 * Validates serial number format
 * @param serialNumber - Serial number to validate
 * @returns boolean indicating if serial number is valid
 */
export function validateSerialNumber(serialNumber: string): boolean {
  if (!serialNumber || typeof serialNumber !== 'string') {
    return false;
  }
  
  // Alphanumeric with optional hyphens and underscores
  const serialRegex = /^[A-Z0-9\-_]+$/i;
  return serialRegex.test(serialNumber) && serialNumber.length >= 5 && serialNumber.length <= 50;
}

/**
 * Validates camera resolution format
 * @param resolution - Camera resolution to validate
 * @returns boolean indicating if resolution is valid
 */
export function validateCameraResolution(resolution: string): boolean {
  if (!resolution || typeof resolution !== 'string') {
    return false;
  }
  
  // Format: 1920x1080, 4K, etc.
  const resolutionRegex = /^(\d+x\d+|4K|8K|HD|FHD|QHD)$/i;
  return resolutionRegex.test(resolution);
}

/**
 * Validates sensor types array
 * @param sensorTypes - Array of sensor types to validate
 * @returns boolean indicating if sensor types are valid
 */
export function validateSensorTypes(sensorTypes: string[]): boolean {
  if (!Array.isArray(sensorTypes)) {
    return false;
  }
  
  if (sensorTypes.length === 0) {
    return false;
  }
  
  const validSensorTypes = [
    'RGB_CAMERA',
    'THERMAL_CAMERA',
    'MULTISPECTRAL',
    'LIDAR',
    'RADAR',
    'GPS',
    'IMU',
    'BAROMETER',
    'MAGNETOMETER'
  ];
  
  return sensorTypes.every(sensor => validSensorTypes.includes(sensor));
}

/**
 * Comprehensive validation for mission input
 * @param input - Mission input object
 * @returns object with validation results
 */
export function validateMissionInput(input: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.name || !validateMissionName(input.name)) {
    errors.push('Invalid mission name');
  }
  
  if (input.plannedAltitude && !validateAltitude(input.plannedAltitude)) {
    errors.push('Invalid planned altitude');
  }
  
  if (input.plannedSpeed && !validateSpeed(input.plannedSpeed)) {
    errors.push('Invalid planned speed');
  }
  
  if (input.overlapPercentage && !validateOverlapPercentage(input.overlapPercentage)) {
    errors.push('Invalid overlap percentage');
  }
  
  if (input.priority && !validateMissionPriority(input.priority)) {
    errors.push('Invalid mission priority');
  }
  
  if (input.estimatedDuration && (typeof input.estimatedDuration !== 'number' || input.estimatedDuration <= 0)) {
    errors.push('Invalid estimated duration');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Comprehensive validation for drone input
 * @param input - Drone input object
 * @returns object with validation results
 */
export function validateDroneInput(input: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.name || !validateDroneName(input.name)) {
    errors.push('Invalid drone name');
  }
  
  if (!input.model || !validateStringLength(input.model, 1, 50)) {
    errors.push('Invalid drone model');
  }
  
  if (!input.serialNumber || !validateSerialNumber(input.serialNumber)) {
    errors.push('Invalid serial number');
  }
  
  if (!validateDroneSpecifications(input)) {
    errors.push('Invalid drone specifications');
  }
  
  if (input.cameraResolution && !validateCameraResolution(input.cameraResolution)) {
    errors.push('Invalid camera resolution');
  }
  
  if (input.sensorTypes && !validateSensorTypes(input.sensorTypes)) {
    errors.push('Invalid sensor types');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Throws a GraphQL error with validation details
 * @param message - Error message
 * @param code - Error code
 * @param details - Additional error details
 */
export function throwValidationError(message: string, code: string = 'VALIDATION_ERROR', details?: any): never {
  throw new GraphQLError(message, {
    extensions: {
      code,
      details
    }
  });
} 