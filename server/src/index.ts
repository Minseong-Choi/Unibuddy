import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.ts';        
import { authMiddleware } from './middleware/auth.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors(), express.json());
app.use('/auth', authRouter);
app.get('/me', authMiddleware, (req, res) => {
  res.json({ userId: req.userId });
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
