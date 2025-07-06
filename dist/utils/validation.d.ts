export declare function validateEmail(email: string): boolean;
export declare function validatePassword(password: string): boolean;
export declare function validateStrongPassword(password: string): boolean;
export declare function validateLatitude(latitude: number): boolean;
export declare function validateLongitude(longitude: number): boolean;
export declare function validateAltitude(altitude: number): boolean;
export declare function validateCoordinates(coordinates: {
    latitude: number;
    longitude: number;
    altitude?: number;
}): boolean;
export declare function validateBatteryLevel(batteryLevel: number): boolean;
export declare function validateSpeed(speed: number): boolean;
export declare function validateGPSAccuracy(accuracy: number): boolean;
export declare function validateHeading(heading: number): boolean;
export declare function validateOverlapPercentage(overlapPercentage: number): boolean;
export declare function validateMissionPriority(priority: number): boolean;
export declare function validateDroneSpecifications(specs: {
    maxFlightTime: number;
    maxSpeed: number;
    maxAltitude: number;
}): boolean;
export declare function validateWaypointSequence(sequence: number): boolean;
export declare function validateUUID(uuid: string): boolean;
export declare function validateDate(date: string | Date): boolean;
export declare function validateStringLength(str: string, minLength: number, maxLength: number): boolean;
export declare function validateOrganizationName(name: string): boolean;
export declare function validateSiteName(name: string): boolean;
export declare function validateDroneName(name: string): boolean;
export declare function validateMissionName(name: string): boolean;
export declare function validateUserNames(firstName: string, lastName: string): boolean;
export declare function validateSerialNumber(serialNumber: string): boolean;
export declare function validateCameraResolution(resolution: string): boolean;
export declare function validateSensorTypes(sensorTypes: string[]): boolean;
export declare function validateMissionInput(input: any): {
    isValid: boolean;
    errors: string[];
};
export declare function validateDroneInput(input: any): {
    isValid: boolean;
    errors: string[];
};
export declare function throwValidationError(message: string, code?: string, details?: any): never;
//# sourceMappingURL=validation.d.ts.map