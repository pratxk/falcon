import { Server as WebSocketServer } from 'ws';
import type { Server as HTTPServer } from 'http';

interface PolylineMessage {
  type: 'missionPolyline';
  missionId: string;
  polyline: Array<{ lat: number; lng: number }>;
}

interface PositionMessage {
  type: 'dronePosition';
  droneId: string;
  missionId: string;
  lat: number;
  lng: number;
  timestamp: number;
}

type WSMessage = PolylineMessage | PositionMessage;

const clients: Record<string, Set<any>> = {};

export function setupWebSocketServer(httpServer: HTTPServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // For demo: parse missionId/droneId from query string
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const missionId = url.searchParams.get('missionId');
    const droneId = url.searchParams.get('droneId');

    // TODO: Add authentication/authorization here

    // Register client
    const key = missionId || droneId;
    if (key) {
      if (!clients[key]) clients[key] = new Set();
      clients[key].add(ws);
    }

    ws.on('close', () => {
      if (key && clients[key]) {
        clients[key].delete(ws);
        if (clients[key].size === 0) delete clients[key];
      }
    });
  });

  // Optionally, add ping/pong or heartbeat logic
}

export function broadcastPolyline(missionId: string, polyline: Array<{ lat: number; lng: number }>) {
  const msg: PolylineMessage = { type: 'missionPolyline', missionId, polyline };
  const set = clients[missionId];
  if (set) {
    for (const ws of set) {
      ws.send(JSON.stringify(msg));
    }
  }
}

export function broadcastDronePosition(droneId: string, missionId: string, lat: number, lng: number, timestamp: number) {
  const msg: PositionMessage = { type: 'dronePosition', droneId, missionId, lat, lng, timestamp };
  const set = clients[missionId] || clients[droneId];
  if (set) {
    for (const ws of set) {
      ws.send(JSON.stringify(msg));
    }
  }
} 