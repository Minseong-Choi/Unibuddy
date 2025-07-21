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
const auth_2 = require("./middleware/auth");
const websocket_1 = require("./websocket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 4000;
// 정적 파일 제공 (WebGL 게임)
app.use('/game', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'webgl')));
app.use((0, cors_1.default)(), express_1.default.json());
app.use('/auth', auth_1.default);
app.get('/me', auth_2.authMiddleware, (req, res) => {
    res.json({ userId: req.userId });
});
const server = http_1.default.createServer(app);
(0, websocket_1.createWebSocketServer)(server);
server.listen(PORT, () => {
    console.log(`Server with WebSocket running on http://localhost:${PORT}`);
});
