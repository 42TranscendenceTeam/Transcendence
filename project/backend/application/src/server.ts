import './config.js';

import express from 'express';
import type { Request, Response } from 'express';
import authRoutes from './auth/auth.routes.js';
import userRoutes from './users/users.routes.js';
import teamsRoutes from './teams/teams.routes.js';
import friendsRoutes from './friends/friends.routes.js';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/teams', teamsRoutes);
app.use('/friends', friendsRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use((err: any, req: any, res: any, next: any) => {
  const status = err.statusCode || 500;

  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
