import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { io } from 'socket.io-client';

const Livechat = () => {
  const [notificationData, setNotificationData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting', 'connected', 'error'
  const [isProcessing, setIsProcessing] = useState(false);
  const socketRef = useRef(null);

  // Notification Modal Component
  const NotificationModal = ({ show, onClose, data }) => {
    if (!show || !data) return null;

    const handleAccept = () => {
      setIsProcessing(true);
      socketRef.current?.emit('accept-request', { 
        bookingId: data.bookingId,
        lawyerId: JSON.parse(sessionStorage.getItem('userData')).userId
      }, (response) => {
        setIsProcessing(false);
        if (response?.status === 'success') {
          onClose();
        } else {
          alert('Failed to accept request: ' + (response?.message || 'Unknown error'));
        }
      });
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
          {data.timestamp && <p><strong>Time:</strong> {new Date(data.timestamp).toLocaleString()}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="danger" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Reject
          </Button>
          <Button 
            variant="success" 
            onClick={handleAccept}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Processing...</span>
              </>
            ) : 'Accept'}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  useEffect(() => {
    const authToken = sessionStorage.getItem('token');
    const userData = JSON.parse(sessionStorage.getItem('userData'));

    if (!authToken || !userData?.userId) {
      console.error('Missing authentication data');
      return;
    }

    setConnectionStatus('connecting');
    
    const socket = io('https://lawyerbackend-qrqa.onrender.com', {
      auth: { token: authToken },
      query: { 
        userType: 'lawyer', 
        userId: userData.userId 
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setConnectionStatus('connected');
      
      socket.emit('join-lawyer', userData.userId, (response) => {
        if (response?.status === 'success') {
          console.log(`Successfully joined lawyer room: ${userData.userId}`);
        } else {
          console.error('Failed to join lawyer room:', response);
        }
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setConnectionStatus('error');
    });

    // Notification handlers
    socket.on('booking-notification', (data) => {
      console.log('Received booking notification:', data);
      if (!data.bookingId) {
        console.error('Invalid notification: missing bookingId');
        return;
      }
      
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
      console.log('Received session request:', data);
      setNotificationData({
        bookingId: data.bookingId,
        userName: data.userName,
        mode: data.mode,
        timestamp: data.timestamp
      });
      setShowModal(true);
    });

    // Debug all events
    socket.onAny((event, ...args) => {
      console.log(`Socket event [${event}]:`, args);
    });

    return () => {
      console.log('Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
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
          {socketRef.current?.id && (
            <Badge bg="secondary" className="ms-2">
              ID: {socketRef.current.id.substring(0, 6)}...
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