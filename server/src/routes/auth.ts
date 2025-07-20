import { Router, Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const db = new PrismaClient();

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

    let user = await db.user.findUnique({ where: { google_id: googleId } });
    if (!user) {
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        user = await db.user.update({
          where: { id: existing.id },
          data: { google_id: googleId }
        });
      } else {
        user = await db.user.create({
          data: { email, google_id: googleId, name, picture_url: picture }
        });
      }
    }

    const jwtToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({ token: jwtToken });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
