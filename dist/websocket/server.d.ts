import type { Server as HTTPServer } from 'http';
export declare function setupWebSocketServer(httpServer: HTTPServer): void;
export declare function broadcastPolyline(missionId: string, polyline: Array<{
    lat: number;
    lng: number;
}>): void;
export declare function broadcastDronePosition(droneId: string, missionId: string, lat: number, lng: number, timestamp: number): void;
//# sourceMappingURL=server.d.ts.map