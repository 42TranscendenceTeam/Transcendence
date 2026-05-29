import './config.js';

import express from 'express';
import type { Request, Response } from 'express';
import { createServer } from 'http';
import { initSocket } from './socket.js';
import authRoutes from './auth/auth.routes.js';
import userRoutes from './users/users.routes.js';
import teamsRoutes from './teams/teams.routes.js';
import tasksRoutes from './tasks/tasks.routes.js';
import friendsRoutes from './friends/friends.routes.js';
import notificationsRoutes from './notifications/notifications.routes.js';
import messageRoutes from './message/message.routes.js';
import teamMessageRoutes from './team_message/team_message.routes.js';

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
app.use('/team/message', teamMessageRoutes);

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

// socket.io

import { createServer } from 'http';
import { Server } from 'socket.io';

const server = createServer(app);
const io = new Server(server, {
	connectionStateRecovery: {},
	cors: {origin: '*', methods: ['GET', 'POST'] },
});

interface EventResponse {
	status: String
}

io.on('connection', (socket) => {
	console.log('a user connected');

	socket.on('join chat', async (userId: number, friendId: number, callback: ({ status }: EventResponse) => void) => {
		const chatId = String(userId) + String(friendId);

		await socket.join(chatId);
		callback({ status: 'chat join acknownledged' });
	});

	socket.on('leave chat', async (userId: number, friendId: number, callback: ({ status }: EventResponse) => void) => {
		const chatId = String(userId) + String(friendId);

		await socket.leave(chatId);
		callback({ status: 'chat leave acknownledged' });
	});

	socket.on('join team chat', async (teamId: number, callback: ({ status }: EventResponse) => void) => {
		await socket.join(String(teamId));
		callback({ status: 'team chat join acknownledged' });
	});

	socket.on('leave team chat', async (teamId: number, callback: ({ status }: EventResponse) => void) => {
		await socket.leave(String(teamId));
		callback({ status: 'team chat leave acknownledged' });
	});

	socket.on('disconnect', () => console.log('user disconnected'));
});

export const getIO = () => {
	if (!io)
		throw new Error('Socket.io not initialized.');

	return io;
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

