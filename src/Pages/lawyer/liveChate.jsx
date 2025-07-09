import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { getSocket } from '../../components/socket';

const Livechat = () => {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [socketId, setSocketId] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const lawyerId = userData?.lawyerId || userData?.userId;

    if (!socket || !lawyerId) {
      console.warn('⚠️ Socket not initialized or missing user ID');
      setConnectionStatus('error');
      return;
    }

    socketRef.current = socket;

    setConnectionStatus(socket.connected ? 'connected' : 'connecting');
    setSocketId(socket.id);

    const onConnect = () => {
      console.log('✅ Socket connected:', socket.id);
      setConnectionStatus('connected');
      setSocketId(socket.id);

      socket.emit('join-lawyer', lawyerId, (response) => {
        if (response?.status === 'success') {
          console.log(`🔗 Joined lawyer room: ${lawyerId}`);
        } else {
          console.error('Join failed:', response);
        }
      });
    };

    const onDisconnect = (reason) => {
      console.warn('🔌 Socket disconnected:', reason);
      setConnectionStatus('disconnected');
      setSocketId(null);
    };

    const onConnectError = (err) => {
      console.error('❌ Socket error:', err);
      setConnectionStatus('error');
      setSocketId(null);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    socket.onAny((event, ...args) => {
      console.log(`📡 Event [${event}]:`, args);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.offAny();
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
    </div>
  );
};

export default Livechat;
