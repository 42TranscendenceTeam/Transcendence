import './config.js';

import express from 'express';
import type { Request, Response } from 'express';
import { createServer } from 'http';
import { initSocket } from './utils/socket.js';
import authRoutes from './auth/auth.routes.js';
import userRoutes from './users/users.routes.js';
import teamsRoutes from './teams/teams.routes.js';
import tasksRoutes from './tasks/tasks.routes.js';
import friendsRoutes from './friends/friends.routes.js';
import notificationsRoutes from './notifications/notifications.routes.js';
import messageRoutes from './message/message.routes.js';

const app = express();
const PORT = 5000;

const httpServer = createServer(app);
initSocket(httpServer);

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/teams', teamsRoutes);
app.use('/tasks', tasksRoutes);
app.use('/friends', friendsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/uploads', express.static('/app/uploads'));
app.use('/public', express.static('/app/public'));
app.use('/message', messageRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use((err: any, req: any, res: any, next: any) => {
  const status = err.statusCode || 500;

  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
