import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';

let io: Server;

export const initSocket = (httpServer: HTTPServer) => {
	io = new Server(httpServer, {
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

		socket.on('disconnect', () => {
			console.log(`User ${userId} disconnected`);
		});
	});

	return io;
};

export const getIO = () => {
	if (!io)
		throw new Error('Socket.IO not initialized.');

	return io;
};
