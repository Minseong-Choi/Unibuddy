"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const tags_1 = __importDefault(require("./routes/tags"));
const clips_1 = __importDefault(require("./routes/clips"));
const auth_2 = require("./middleware/auth");
const websocket_1 = require("./websocket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 정적 파일 제공 (WebGL 게임)
app.use('/game', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'webgl')));
app.use('/projects', projects_1.default);
app.use('/auth', auth_1.default);
app.use('/projects/:projectId/tags', tags_1.default);
app.use('/projects/:projectId/clips', clips_1.default);
app.get('/me', auth_2.authMiddleware, (req, res) => {
    res.json({ userId: req.userId });
});
// 방 생성 엔드포인트
app.post('/create-room', (req, res) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    websocket_1.rooms[roomId] = { clients: [], turn: 1 };
    console.log(`Room ${roomId} created`);
    res.json({ roomId });
});
// 방 체크 엔드포인트
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
const server = http_1.default.createServer(app);
(0, websocket_1.createWebSocketServer)(server);
server.listen(PORT, () => {
    console.log(`Server with WebSocket running on http://34.47.75.182:${PORT}`);
});
