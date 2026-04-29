import './config.js';

import express from 'express';
import type { Request, Response } from 'express';
import authRoutes from './auth/auth.routes.js';

import { authMiddleware } from './middleware/auth.middleware.js';
import type { AuthRequest } from './middleware/auth.middleware.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/auth', authRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/users/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({
    message: 'You are authenticated',
    user: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
