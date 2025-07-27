"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const websocket_1 = require("./websocket");
const cors_1 = __importDefault(require("cors"));
const WS_PORT = 4000;
// 1. Express 앱 생성
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 2. REST API 라우팅
app.post('/create-room', (req, res) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    websocket_1.rooms[roomId] = { clients: [], turn: 1 };
    console.log(`Room ${roomId} created`);
    res.json({ roomId });
});
app.get('/check-room/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    if (websocket_1.rooms[roomId]) {
        const isFull = websocket_1.rooms[roomId].clients.length >= 2;
        res.json({ exists: true, full: isFull });
    }
    else {
        res.json({ exists: false, full: false });
    }
});
// 3. HTTP 서버로 감싸기
const server = http_1.default.createServer(app);
// 4. WebSocket 서버 연결
(0, websocket_1.createWebSocketServer)(server);
// 5. 실행
server.listen(WS_PORT, () => {
    console.log(`✅ WebSocket + API server running at http://34.47.75.182:${WS_PORT}`);
});
