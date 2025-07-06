"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = validateEmail;
exports.validatePassword = validatePassword;
exports.validateStrongPassword = validateStrongPassword;
exports.validateLatitude = validateLatitude;
exports.validateLongitude = validateLongitude;
exports.validateAltitude = validateAltitude;
exports.validateCoordinates = validateCoordinates;
exports.validateBatteryLevel = validateBatteryLevel;
exports.validateSpeed = validateSpeed;
exports.validateGPSAccuracy = validateGPSAccuracy;
exports.validateHeading = validateHeading;
exports.validateOverlapPercentage = validateOverlapPercentage;
exports.validateMissionPriority = validateMissionPriority;
exports.validateDroneSpecifications = validateDroneSpecifications;
exports.validateWaypointSequence = validateWaypointSequence;
exports.validateUUID = validateUUID;
exports.validateDate = validateDate;
exports.validateStringLength = validateStringLength;
exports.validateOrganizationName = validateOrganizationName;
exports.validateSiteName = validateSiteName;
exports.validateDroneName = validateDroneName;
exports.validateMissionName = validateMissionName;
exports.validateUserNames = validateUserNames;
exports.validateSerialNumber = validateSerialNumber;
exports.validateCameraResolution = validateCameraResolution;
exports.validateSensorTypes = validateSensorTypes;
exports.validateMissionInput = validateMissionInput;
exports.validateDroneInput = validateDroneInput;
exports.throwValidationError = throwValidationError;
const graphql_1 = require("graphql");
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return false;
    }
    if (password.length < 8) {
        return false;
    }
    return true;
}
function validateStrongPassword(password) {
    if (!validatePassword(password)) {
        return false;
    }
    if (!/[A-Z]/.test(password)) {
        return false;
    }
    if (!/[a-z]/.test(password)) {
        return false;
    }
    if (!/\d/.test(password)) {
        return false;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return false;
    }
    return true;
}
function validateLatitude(latitude) {
    if (typeof latitude !== 'number' || isNaN(latitude)) {
        return false;
    }
    return latitude >= -90 && latitude <= 90;
}
function validateLongitude(longitude) {
    if (typeof longitude !== 'number' || isNaN(longitude)) {
        return false;
    }
    return longitude >= -180 && longitude <= 180;
}
function validateAltitude(altitude) {
    if (typeof altitude !== 'number' || isNaN(altitude)) {
        return false;
    }
    return altitude >= 0;
}
function validateCoordinates(coordinates) {
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
function validateBatteryLevel(batteryLevel) {
    if (typeof batteryLevel !== 'number' || isNaN(batteryLevel)) {
        return false;
    }
    return batteryLevel >= 0 && batteryLevel <= 100;
}
function validateSpeed(speed) {
    if (typeof speed !== 'number' || isNaN(speed)) {
        return false;
    }
    return speed >= 0;
}
function validateGPSAccuracy(accuracy) {
    if (typeof accuracy !== 'number' || isNaN(accuracy)) {
        return false;
    }
    return accuracy >= 0;
}
function validateHeading(heading) {
    if (typeof heading !== 'number' || isNaN(heading)) {
        return false;
    }
    return heading >= 0 && heading <= 360;
}
function validateOverlapPercentage(overlapPercentage) {
    if (typeof overlapPercentage !== 'number' || isNaN(overlapPercentage)) {
        return false;
    }
    return overlapPercentage >= 0 && overlapPercentage <= 100;
}
function validateMissionPriority(priority) {
    if (typeof priority !== 'number' || isNaN(priority)) {
        return false;
    }
    return priority >= 1 && priority <= 10;
}
function validateDroneSpecifications(specs) {
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
function validateWaypointSequence(sequence) {
    if (typeof sequence !== 'number' || isNaN(sequence)) {
        return false;
    }
    return sequence >= 1 && Number.isInteger(sequence);
}
function validateUUID(uuid) {
    if (!uuid || typeof uuid !== 'string') {
        return false;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
function validateDate(date) {
    if (!date) {
        return false;
    }
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
}
function validateStringLength(str, minLength, maxLength) {
    if (typeof str !== 'string') {
        return false;
    }
    const length = str.trim().length;
    return length >= minLength && length <= maxLength;
}
function validateOrganizationName(name) {
    return validateStringLength(name, 2, 100);
}
function validateSiteName(name) {
    return validateStringLength(name, 2, 100);
}
function validateDroneName(name) {
    return validateStringLength(name, 2, 50);
}
function validateMissionName(name) {
    return validateStringLength(name, 2, 100);
}
function validateUserNames(firstName, lastName) {
    if (!validateStringLength(firstName, 1, 50)) {
        return false;
    }
    if (!validateStringLength(lastName, 1, 50)) {
        return false;
    }
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(firstName) && nameRegex.test(lastName);
}
function validateSerialNumber(serialNumber) {
    if (!serialNumber || typeof serialNumber !== 'string') {
        return false;
    }
    const serialRegex = /^[A-Z0-9\-_]+$/i;
    return serialRegex.test(serialNumber) && serialNumber.length >= 5 && serialNumber.length <= 50;
}
function validateCameraResolution(resolution) {
    if (!resolution || typeof resolution !== 'string') {
        return false;
    }
    const resolutionRegex = /^(\d+x\d+|4K|8K|HD|FHD|QHD)$/i;
    return resolutionRegex.test(resolution);
}
function validateSensorTypes(sensorTypes) {
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
function validateMissionInput(input) {
    const errors = [];
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
function validateDroneInput(input) {
    const errors = [];
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
function throwValidationError(message, code = 'VALIDATION_ERROR', details) {
    throw new graphql_1.GraphQLError(message, {
        extensions: {
            code,
            details
        }
    });
}
//# sourceMappingURL=validation.js.map