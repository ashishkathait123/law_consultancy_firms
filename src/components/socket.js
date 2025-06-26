// socket.js
import { io } from 'socket.io-client';

let socket;

export const initSocket = (token, userId, userType) => {
  if (!socket) {
    socket = io('https://lawyerbackend-qrqa.onrender.com', {
      auth: { token },
      query: { userId, userType },
      path: '/socket.io',
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const getSocket = () => socket;