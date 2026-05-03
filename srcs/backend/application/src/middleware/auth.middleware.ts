import { JWT_SECRET } from '../config.js';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type JwtUser = {
  id: string;
};

export interface AuthRequest extends Request {
  user?: JwtUser | string | jwt.JwtPayload;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}