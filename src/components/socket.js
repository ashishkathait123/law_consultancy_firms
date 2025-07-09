// === socket.js ===
import { io } from 'socket.io-client';

const SERVER_URL = 'https://lawyerbackend-qrqa.onrender.com';

export const initSocket = (token, userId, userType) => {
  // 🔒 Validate inputs
  if (!token || !userId || !userType) {
    console.error('❌ Missing authentication data:', {
      token,
      userId,
      userType,
    });
    return null;
  }
  if (!token || !userId) {
    console.warn("⚠️ Cannot init socket — missing token or userId");
    return null;
  }
  // ✅ Return existing connection if active
  if (window.socket?.connected) return window.socket;

  // 🚀 Initialize only once
  if (!window.socket) {
    window.socket = io(SERVER_URL, {
      auth: { token },
      query: { userId, userType },
      path: '/socket.io',
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Debug logs
    window.socket.on('connect', () => {
      console.log('✅ Global socket connected:', window.socket.id);
    });

    window.socket.on('disconnect', (reason) => {
      console.warn('⚠️ Global socket disconnected:', reason);
    });

    window.socket.on('connect_error', (err) => {
      console.error('❌ Global socket connection error:', err.message);
    });

    window.socket.on('error', (err) => {
      console.error('🛑 Socket error:', err);
    });
  }

  return window.socket;
};

export const getSocket = () => window.socket;

export const disconnectSocket = () => {
  if (window.socket) {
    console.log('🔌 Disconnecting socket...');
    window.socket.disconnect();
    window.socket = null;
  }
};
