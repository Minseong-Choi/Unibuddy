import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // .env의 환경변수를 process.env로 사용할 수 있게함
import { PrismaClient } from '@prisma/client';

dotenv.config(); //.env를 읽어 process.env에 로드
const app = express();
const db = new PrismaClient(); // prisma와 연결할 클라이언트 생성. 

app.use(cors(), express.json()); //.use : 미들웨어 설정, cors는 모든 요청 허용
app.get('/', (_,res)=>res.send('OK'));
app.listen(4000, ()=> console.log('Listening on :4000'));

// 간단한 GET 요청 처리
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the Express server!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
