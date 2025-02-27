import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://backend-elos.onrender.com'
  : 'https://localhost:9000';

const socket = io(SOCKET_URL, {
  path: '/socket.io',
  transports: ['websocket', 'polling'], // Allow fallback to polling
  secure: process.env.NODE_ENV === 'production',
  rejectUnauthorized: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  autoConnect: true
});

// Enhanced error handling
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('connect', () => {
  console.log('Connected to socket server');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from socket server:', reason);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

export default socket;