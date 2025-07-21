import { Router, Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const router = Router();

interface GoogleReq { token?: string; }

router.post('/google', async (req: Request<{}, {}, GoogleReq>, res: Response) => {
  const token = req.body.token;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    const { data: profile } = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { sub: googleId, email, name, picture } = profile as any;

    let user = await prisma.user.findUnique({ where: { google_id: googleId } });
    if (!user) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        user = await prisma.user.update({
          where: { id: existing.id },
          data: { google_id: googleId }
        });
      } else {
        user = await prisma.user.create({
          data: { email, google_id: googleId, name }
        });
      }
    }

    const jwtToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({ token: jwtToken });
  } catch (err: any) {
    console.error('🔥 /auth/google error:', err);

    // Axios 요청 실패라면 응답 상태와 데이터도 찍어 보기
    
      console.error('  axios status:', err.response?.status);
      console.error('  axios data:  ', err.response?.data);
    
    // JWT 발급 중 에러라면 err.message 로 확인
    return res.status(500).json({ error: err.message });
  }
});

export default router;
