import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { io } from 'socket.io-client';

const LawyerDashboard = () => {
  const [notificationData, setNotificationData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // Notification Modal Component
  const NotificationModal = ({ show, onClose, data }) => {
    if (!show || !data) return null;

    return (
      <Modal show={show} onHide={onClose} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>New Consultation Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Client:</strong> {data.userName || 'Unknown'}</p>
          <p><strong>Service:</strong> {data.mode}</p>
          {data.amount && <p><strong>Amount:</strong> ₹{data.amount}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={onClose}>Reject</Button>
          <Button variant="success" onClick={() => {
            if (socketRef.current && data.bookingId) {
              socketRef.current.emit('accept-request', { bookingId: data.bookingId });
            }
            onClose();
          }}>Accept</Button>
        </Modal.Footer>
      </Modal>
    );
  };

  useEffect(() => {
    const authToken = sessionStorage.getItem('token');
    const userData = JSON.parse(sessionStorage.getItem('userData'));

    if (!authToken || !userData?.userId) return;

    const socket = io('https://lawyerbackend-qrqa.onrender.com', {
      auth: { token: authToken },
      query: { userType: 'lawyer', userId: userData.userId },
      path: '/socket.io',
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Socket connection success
    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      setConnected(true);
      socket.emit('join-lawyer', userData.userId);
    });

    // Optional join confirmation
    socket.on('joined-lawyer-room', ({ lawyerId }) => {
      console.log(`✅ Joined lawyer room: ${lawyerId}`);
    });

    // Handle disconnects and errors
    socket.on('disconnect', () => {
      console.log('⚠️ Socket disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
    });

    // Debug all socket events (optional)
    socket.onAny((event, ...args) => {
      console.log(`📡 Socket event received: ${event}`, args);
    });

    // Handle booking notifications
    socket.on('booking-notification', (data) => {
      console.log('📬 Booking notification received:', data);
      setNotificationData({
        bookingId: data.bookingId,
        userName: data.userName,
        mode: data.mode,
        amount: data.amount,
        timestamp: data.timestamp
      });
      setShowModal(true);
    });

    // Handle session start
    socket.on('incoming-session-request', (data) => {
      console.log('📬 Incoming session request:', data);
      setNotificationData({
        bookingId: data.bookingId,
        userName: data.userName,
        mode: data.mode,
        timestamp: data.timestamp
      });
      setShowModal(true);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return (
    <div className="container mt-5">
      <h2>🧑‍⚖️ Lawyer Dashboard</h2>
      <p>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>

      <NotificationModal 
        show={showModal}
        onClose={() => setShowModal(false)}
        data={notificationData}
      />
    </div>
  );
};

export default LawyerDashboard;
