import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid Authorization header' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    if (typeof payload !== 'object' || payload === null || !('userId' in payload)) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = (payload as { userId: string }).userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
