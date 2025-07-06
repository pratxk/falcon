"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocketServer = setupWebSocketServer;
exports.broadcastPolyline = broadcastPolyline;
exports.broadcastDronePosition = broadcastDronePosition;
const ws_1 = require("ws");
const clients = {};
function setupWebSocketServer(httpServer) {
    const wss = new ws_1.Server({ server: httpServer, path: '/ws' });
    wss.on('connection', (ws, req) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const missionId = url.searchParams.get('missionId');
        const droneId = url.searchParams.get('droneId');
        const key = missionId || droneId;
        if (key) {
            if (!clients[key])
                clients[key] = new Set();
            clients[key].add(ws);
        }
        ws.on('close', () => {
            if (key && clients[key]) {
                clients[key].delete(ws);
                if (clients[key].size === 0)
                    delete clients[key];
            }
        });
    });
}
function broadcastPolyline(missionId, polyline) {
    const msg = { type: 'missionPolyline', missionId, polyline };
    const set = clients[missionId];
    if (set) {
        for (const ws of set) {
            ws.send(JSON.stringify(msg));
        }
    }
}
function broadcastDronePosition(droneId, missionId, lat, lng, timestamp) {
    const msg = { type: 'dronePosition', droneId, missionId, lat, lng, timestamp };
    const set = clients[missionId] || clients[droneId];
    if (set) {
        for (const ws of set) {
            ws.send(JSON.stringify(msg));
        }
    }
}
//# sourceMappingURL=server.js.map