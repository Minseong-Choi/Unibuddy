import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import authRouter from './routes/auth';
import { authMiddleware } from './middleware/auth';
import { createWebSocketServer } from './websocket';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;

// 정적 파일 제공 (WebGL 게임)
app.use('/game', express.static(path.join(__dirname, '..', 'public', 'webgl')));

app.use(cors(), express.json());
app.use('/auth', authRouter);
app.get('/me', authMiddleware, (req, res) => {
  res.json({ userId: req.userId });
});

const server = http.createServer(app);

createWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server with WebSocket running on http://localhost:${PORT}`);
});
