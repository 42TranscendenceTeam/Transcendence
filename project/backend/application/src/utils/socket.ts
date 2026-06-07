import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { getFriends } from '../friends/friends.service.js';

let io: Server;

var onlineUsers = new Map<number, Set<string>>();

interface EventResponse {
	status: String
}

export const initSocket = (httpServer: HTTPServer) => {
	io = new Server(httpServer, {
		connectionStateRecovery: {},
		cors: {
			origin: '*',
		},
	});

	io.use((socket, next) => {
		try {
			const token = socket.handshake.auth.token;

			if (!token)
				return next(new Error('No token provided'));

			const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

			if (typeof decoded.id !== 'number')
				return next(new Error('Invalid token payload'));

			socket.data.userId = decoded.id;

			next();
		} catch {
			next(new Error('Invalid token'));
		}
	});

	io.on('connection', (socket) => {
		const userId = socket.data.userId;

		socket.join(`user:${userId}`);

		console.log(`User ${userId} connected with socket ${socket.id}`);

		if (!onlineUsers.has(userId))
			onlineUsers.set(userId, new Set());

		onlineUsers.get(userId)!.add(socket.id);

		getFriends(userId).then(friends => {
			const friendsIds = friends.map(f => f.id);

			if (onlineUsers.get(userId)!.size === 1) 
					friendsIds.forEach(fid => io.to(`user:${fid}`).emit('user online', userId));

			const onlineFriendsIds = friendsIds.filter(fid => onlineUsers.has(fid));
			socket.emit('online friends', onlineFriendsIds);
				
		}).catch(err => console.error('Failed on connect:', err));

		socket.on('join chat', async (userId: number, friendId: number, callback: ({ status }: EventResponse) => void) => {
			var chatId = "";

			if (userId <= friendId) {
				chatId = String(userId) + String(friendId);
			} else {
				chatId = String(friendId) + String(userId);
			}

			await socket.join(chatId);
			callback({ status: 'chat join acknownledged' });
		});

		socket.on('leave chat', async (userId: number, friendId: number, callback: ({ status }: EventResponse) => void) => {
			var chatId = "";

			if (userId <= friendId) {
				chatId = String(userId) + String(friendId);
			} else {
				chatId = String(friendId) + String(userId);
			}

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

		socket.on('disconnect', async () => {
			console.log(`User ${userId} disconnected`);

			const sockets = onlineUsers.get(userId);
			if (sockets) {
				sockets.delete(socket.id);
				if (sockets.size === 0) {
					onlineUsers.delete(userId);

					getFriends(userId).then(friends => {
						friends.map(f => f.id).forEach(fid => io.to(`user:${fid}`).emit('user offline', userId));
					}).catch(err => console.error('Failed on disconnect:', err));
				}
			}
		});

	});

	return io;
};

export const getIO = () => {
	if (!io)
		throw new Error('Socket.IO not initialized.');

	return io;
};

export const getOnlineUsers = () => {
	if (!onlineUsers)
		throw new Error('onlineUsers is not initialized.');

	return onlineUsers;
};
