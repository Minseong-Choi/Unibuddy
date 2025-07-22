import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import tagsRouter from './routes/tags';
import clipsRouter from './routes/clips';
import { authMiddleware } from './middleware/auth';
import { createWebSocketServer, rooms } from './websocket';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 정적 파일 제공 (WebGL 게임)
app.use('/game', express.static(path.join(__dirname, '..', 'public', 'webgl')));
app.use('/projects', projectsRouter);
app.use('/auth', authRouter);
app.use('/projects/:projectId/tags', tagsRouter);
app.use('/projects/:projectId/clips', clipsRouter);
app.get('/me', authMiddleware, (req, res) => {
  res.json({ userId: req.userId });
});

// 방 생성 엔드포인트
app.post('/create-room', (req, res) => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  rooms[roomId] = { clients: [], turn: 1 };
  console.log(`Room ${roomId} created`);
  res.json({ roomId });
});

// 방 체크 엔드포인트
app.get('/check-room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  if (rooms[roomId]) {
    const isFull = rooms[roomId].clients.length >= 2;
    res.json({ exists: true, full: isFull });
  } else {
    res.json({ exists: false, full: false });
  }
});


const server = http.createServer(app);

createWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server with WebSocket running on http://localhost:${PORT}`);
});
