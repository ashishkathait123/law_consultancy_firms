import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { io } from 'socket.io-client';

const Livechat = () => {
  const [notificationData, setNotificationData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // default to connecting
  const [isProcessing, setIsProcessing] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const socketRef = useRef(null);

  // Modal for notifications
  const NotificationModal = ({ show, onClose, data }) => {
    if (!show || !data) return null;

    const handleAccept = () => {
      setIsProcessing(true);
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      const lawyerId = userData?.lawyerId || userData?.userId;

      socketRef.current?.emit(
        'accept-request',
        { bookingId: data.bookingId, lawyerId },
        (response) => {
          setIsProcessing(false);
          if (response?.status === 'success') {
            onClose();
          } else {
            alert('Failed to accept request: ' + (response?.message || 'Unknown error'));
          }
        }
      );
    };

    return (
      <Modal show={show} onHide={onClose} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>New Consultation Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Client:</strong> {data.userName || 'Unknown Client'}</p>
          <p><strong>Service:</strong> {data.mode || 'consultation'}</p>
          {data.amount && <p><strong>Amount:</strong> ₹{data.amount}</p>}
          {data.timestamp && (
            <p><strong>Time:</strong> {new Date(data.timestamp).toLocaleString()}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={onClose} disabled={isProcessing}>
            Reject
          </Button>
          <Button variant="success" onClick={handleAccept} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Spinner animation="border" size="sm" /> <span className="ms-2">Processing...</span>
              </>
            ) : (
              'Accept'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  useEffect(() => {
    const authToken = sessionStorage.getItem('token');
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const lawyerId = userData?.lawyerId || userData?.userId;

    if (!authToken || !lawyerId) {
      console.error('Missing authentication data');
      setConnectionStatus('error');
      return;
    }

    setConnectionStatus('connecting');

    const socket = io('https://lawyerbackend-qrqa.onrender.com', {
      auth: { token: authToken },
      query: { userType: 'lawyer', userId: lawyerId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      socketRef.current = socket;
      setSocketId(socket.id);
      setConnectionStatus('connected');

      socket.emit('join-lawyer', lawyerId, (response) => {
        if (response?.status === 'success') {
          console.log(`Joined lawyer room: ${lawyerId}`);
        } else {
          console.error('Join failed:', response);
        }
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
      setConnectionStatus('disconnected');
      setSocketId(null);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
      setConnectionStatus('error');
      setSocketId(null);
    });

    socket.on('booking-notification', (data) => {
      console.log('📩 Booking notification:', data);
      if (!data.bookingId) return;
      setNotificationData({
        bookingId: data.bookingId,
        userName: data.userName,
        mode: data.mode,
        amount: data.amount,
        timestamp: data.timestamp
      });
      setShowModal(true);
    });

    socket.on('incoming-session-request', (data) => {
      console.log('📩 Session request:', data);
      setNotificationData({
        bookingId: data.bookingId,
        userName: data.userName,
        mode: data.mode,
        timestamp: data.timestamp
      });
      setShowModal(true);
    });

    socket.onAny((event, ...args) => {
      console.log(`📡 Event received [${event}]:`, args);
    });

    return () => {
      console.log('🔌 Disconnecting socket');
      socket.disconnect();
      socketRef.current = null;
      setSocketId(null);
    };
  }, []);

  const getStatusBadge = () => {
    const statusMap = {
      connecting: { variant: 'warning', text: 'Connecting...' },
      connected: { variant: 'success', text: 'Connected' },
      disconnected: { variant: 'danger', text: 'Disconnected' },
      error: { variant: 'danger', text: 'Connection Error' },
    };
    const status = statusMap[connectionStatus] || statusMap.disconnected;
    return <Badge bg={status.variant}>{status.text}</Badge>;
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Lawyer Consultation Portal</h2>
        <div>
          {getStatusBadge()}
          {socketId && (
            <Badge bg="secondary" className="ms-2">
              ID: {socketId.slice(0, 6)}...
            </Badge>
          )}
        </div>
      </div>

      <Alert variant="info">
        You will receive live notifications for new consultation requests here.
      </Alert>

      <NotificationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        data={notificationData}
      />
    </div>
  );
};

export default Livechat;
