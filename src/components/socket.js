// socket.js
import { io } from 'socket.io-client';

const SERVER_URL = 'https://lawyerbackend-qrqa.onrender.com';

let socket = null;
let sessionAcked = false;
let retryCount = 0;
const maxRetries = 5;
const retryDelay = 2000; // 2 seconds

function sendSessionStart(userId, userType) {
  if (sessionAcked || retryCount >= maxRetries) return;

  console.log(`📤 Sending session-started (attempt ${retryCount + 1})`);
  retryCount++;

  socket.emit("session-started", { userId, userType }, (ack) => {
    if (ack?.success) {
      console.log("✅ Session acknowledged by server");
      sessionAcked = true;
    } else {
      console.warn("⚠️ No acknowledgment, retrying...");
      setTimeout(() => sendSessionStart(userId, userType), retryDelay);
    }
  });
}

export const initSocket = (token, userId, userType) => {
  if (!token || !userId || !userType) {
    console.error('❌ Missing socket init params');
    return null;
  }

  if (socket && socket.connected) return socket;

  sessionAcked = false;
  retryCount = 0;

  socket = io(SERVER_URL, {
    auth: { token },
    query: { userId, userType },
    path: '/socket.io',
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    sendSessionStart(userId, userType);
  });

  socket.on('disconnect', (reason) => {
    console.warn('⚠️ Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};
