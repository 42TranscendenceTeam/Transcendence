import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const SOCKET_URL = API_URL.startsWith('http')
  ? new URL(API_URL).origin
  : undefined;

let socket: ReturnType<typeof io> | null = null;

export function connectSocket(token: string) {
  if (socket) return;

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket() {
  return socket;
}
