import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: Server;

export const initSocket = (httpServer: HTTPServer) => {
	io = new Server(httpServer, {
		cors: {
			origin: '*',
		},
	});

	io.on('connection', (socket) => {
		console.log('Socket connected:', socket.id);

		socket.emit('hello', {
			message: 'Connected to Socket.IO server',
		});

		socket.on('disconnect', () => {
			console.log('Socket disconnected:', socket.id);
		});
	});

	return io;
};

export const getIO = () => {
	if (!io)
		throw new Error('Socket.IO not initialized.');

	return io;
};
