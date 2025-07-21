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
import { createWebSocketServer } from './websocket';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;
app.use(cors(), express.json());
// 정적 파일 제공 (WebGL 게임)
app.use('/game', express.static(path.join(__dirname, '..', 'public', 'webgl')));
app.use('/projects', projectsRouter);
app.use('/auth', authRouter);
app.use('/projects/:projectId/tags', tagsRouter);
app.use('/projects/:projectId/clips', clipsRouter);
app.get('/me', authMiddleware, (req, res) => {
  res.json({ userId: req.userId });
});

const server = http.createServer(app);

createWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server with WebSocket running on http://localhost:${PORT}`);
});
