import { JWT_SECRET } from '../config.js';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {id: number};
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      token = req.query.token as string | undefined;
    }

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { id: number; };

    if (decoded.type !== "auth") {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
