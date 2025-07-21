import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if(!token) return res.status(401).json({ error: '토큰 필요' });
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = Number(payload.sub);
    next();
  }catch{
    return res.status(401).json({error: '유효하지 않은 토큰'});
  }
}
