"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebSocketServer = void 0;
const ws_1 = require("ws");
const url_1 = __importDefault(require("url"));
const rooms = {};
const readyStatus = {};
const restartVotes = {};
const createWebSocketServer = (server) => {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws, req) => {
        const queryObject = url_1.default.parse(req.url || '', true).query;
        const roomId = queryObject.room;
        if (!roomId) {
            ws.close();
            return;
        }
        if (!rooms[roomId]) {
            rooms[roomId] = { clients: [], turn: 1 };
        }
        if (rooms[roomId].clients.length >= 2) {
            ws.send(JSON.stringify({ type: "full" }));
            ws.close();
            return;
        }
        rooms[roomId].clients.push(ws);
        const playerNumber = rooms[roomId].clients.length;
        ws.send(JSON.stringify({ type: "welcome", player: playerNumber }));
        ws.on('message', (message) => {
            const msg = JSON.parse(message);
            const currentRoom = rooms[roomId];
            if (!currentRoom)
                return;
            // 모든 클라이언트에게 메시지를 브로드캐스트하는 함수
            const broadcast = (data) => {
                currentRoom.clients.forEach(client => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            };
            // 특정 클라이언트를 제외하고 브로드캐스트하는 함수
            const broadcastExclude = (data, excludeWs) => {
                currentRoom.clients.forEach(client => {
                    if (client !== excludeWs && client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            };
            switch (msg.type) {
                case "ready":
                    if (!readyStatus[roomId])
                        readyStatus[roomId] = {};
                    readyStatus[roomId][playerNumber] = true;
                    if (Object.keys(readyStatus[roomId]).length === 2) {
                        broadcast({ type: "start" });
                        broadcast({ type: "turn", next: 1 });
                    }
                    break;
                case "turn":
                    // 턴을 전환하고 모든 클라이언트에게 알림
                    currentRoom.turn = msg.next;
                    broadcast(msg);
                    break;
                case "restart":
                    if (!restartVotes[roomId])
                        restartVotes[roomId] = {};
                    restartVotes[roomId][playerNumber] = true;
                    if (Object.keys(restartVotes[roomId]).length === 2) {
                        broadcast({ type: "restartConfirmed" });
                        // 재시작 메시지를 보낸 후, 방 정보를 완전히 초기화합니다.
                        delete rooms[roomId];
                        delete readyStatus[roomId];
                        delete restartVotes[roomId];
                    }
                    break;
                default:
                    // 'turn'을 제외한 다른 모든 메시지는 보낸 사람을 제외하고 릴레이
                    broadcastExclude(msg, ws);
                    break;
            }
        });
        ws.on('close', () => {
            if (rooms[roomId]) {
                rooms[roomId].clients = rooms[roomId].clients.filter(c => c !== ws);
                if (rooms[roomId].clients.length === 0) {
                    delete rooms[roomId];
                    delete readyStatus[roomId];
                    delete restartVotes[roomId];
                }
            }
        });
    });
};
exports.createWebSocketServer = createWebSocketServer;
