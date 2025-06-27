// ✅ Updated LawyerDashboard.jsx with booking-accepted emit
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { initSocket, getSocket } from '../../components/socket';

const LawyerDashboard = () => {
  const [notificationData, setNotificationData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  const updateBookingStatus = async (bookingId, status) => {
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`https://lawyerbackend-qrqa.onrender.com/lawapi/common/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const text = await res.text();
      const result = JSON.parse(text);
      if (res.ok) {
        console.log(`✅ Booking ${status} successfully:`, result);
      if (status === 'accepted') {
  const socket = getSocket();
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  
  // 👇 Fetch userId from notificationData (where it was passed in booking-notification)
  const userId = notificationData?.userId;

  socket.emit('booking-accepted', {
    bookingId,
    lawyerId: userData.lawyerId,
    userId, // ✅ IMPORTANT: pass userId to reach client
  });
}

      } else {
        console.error(`❌ Booking ${status} failed:`, result.message || result);
      }
    } catch (err) {
      console.error('❌ Failed to update booking:', err);
    }
  };

  const NotificationModal = ({ show, onClose, data }) => {
    if (!show || !data) return null;
    const handleAccept = async () => {
      await updateBookingStatus(data.bookingId, 'accepted');
      onClose();
    };
    const handleReject = async () => {
      await updateBookingStatus(data.bookingId, 'rejected');
      onClose();
    };
    return (
      <Modal show={show} onHide={onClose} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>New Consultation Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Client:</strong> {data.name || 'Unknown'}</p>
          <p><strong>Service:</strong> {data.mode}</p>
          <p><strong>Date:</strong> {data.timestamp || 'N/A'}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleReject}>Reject</Button>
          <Button variant="success" onClick={handleAccept}>Accept</Button>
        </Modal.Footer>
      </Modal>
    );
  };

  useEffect(() => {
    const authToken = sessionStorage.getItem('token');
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!authToken || !userData?.lawyerId) return;
    const socket = initSocket(authToken, userData.lawyerId, 'lawyer');
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-lawyer', userData.lawyerId);
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('joined-lawyer-room', ({ lawyerId }) => {
      console.log(`🎉 Joined lawyer room: ${lawyerId}`);
    });
    socket.onAny((event, ...args) => console.log(`📡 Event: ${event}`, args));

    socket.on('booking-notification', (data) => {
  setNotificationData({
    bookingId: data.bookingId,
    name: data.userName,
    userId: data.userId,       // ✅ capture userId for later use
    mode: data.mode,
    timestamp: data.createdAt
  });
  setShowModal(true);
});


    return () => {
      if (socket.connected) socket.disconnect();
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
