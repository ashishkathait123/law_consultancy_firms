import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../components/AuthContext';
import './ChatBox.css';
import { initSocket } from '../components/socket';

const ChatBox = ({ sessionToken, chatDuration, lawyer, bookingId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [remainingTime, setRemainingTime] = useState(chatDuration * 60);
  const [sessionStatus, setSessionStatus] = useState('waiting'); // waiting | active | expired
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const auth = useAuth();
  const currentUser = auth?.currentUser;

  useEffect(() => {
    if (!sessionToken || !currentUser || !bookingId) return;

    const socket = initSocket(sessionToken, currentUser.id, 'client');
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join-booking', bookingId);
    });

    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setSocketConnected(false);
    });

    socket.on('session-started', (data) => {
      if (data.bookingId === bookingId) {
        setSessionStatus('active');
        setRemainingTime(data.duration || chatDuration * 60);
        console.log('✅ session-started received:', data);
      }
    });

    socket.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    socket.on('session-time', ({ remaining }) => {
      setRemainingTime(remaining);
    });

    socket.on('session-ended', () => {
      setSessionStatus('expired');
    });

    // ✅ Fallback: Force session active if not triggered in time
    const fallbackTimer = setTimeout(() => {
      if (sessionStatus === 'waiting') {
        console.warn('⚠️ session-started not received, forcing session active');
        setSessionStatus('active');
        socket.emit('session-started', {
          bookingId,
          duration: chatDuration * 60
        });
      }
    }, 5000); // fallback after 5 seconds

    return () => {
      clearTimeout(fallbackTimer);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('session-started');
      socket.off('new-message');
      socket.off('session-time');
      socket.off('session-ended');
    };
  }, [sessionToken, currentUser, bookingId, chatDuration, sessionStatus]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || sessionStatus !== 'active') return;

    const msg = {
      id: uuidv4(),
      sender: currentUser.name,
      senderId: currentUser.id,
      content: message,
      type: 'text',
      bookingId,
      timestamp: new Date().toISOString()
    };

    socketRef.current?.emit('chat-message', msg);
    setMessages((prev) => [...prev, msg]);
    setMessage('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${mins}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleEndSession = () => {
    if (window.confirm('Are you sure you want to end this session?')) {
      socketRef.current?.emit('end-session', { sessionToken });
      setSessionStatus('expired');
    }
  };

  return (
    <div className="legal-chat-container">
      <div className="connection-status">
        {socketConnected ? '🟢 Connected' : '🔴 Disconnected'} | Status: {sessionStatus}
      </div>

      <div className="legal-chat-header">
        <div className="lawyer-profile">
          <div className="lawyer-avatar">
            {lawyer?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="lawyer-info">
            <h3>Consultation with {lawyer?.name}</h3>
            <p>{lawyer?.specialization || 'Legal Professional'}</p>
          </div>
        </div>
        <div className="session-info">
          <div className="session-timer">{formatTime(remainingTime)}</div>
          <div className={`session-status ${sessionStatus}`}>
            {sessionStatus === 'active' ? 'Session Active' : 'Waiting...'}
          </div>
          {sessionStatus === 'active' && (
            <button className="end-session-btn" onClick={handleEndSession}>
              End Session
            </button>
          )}
        </div>
      </div>

      <div className="legal-chat-messages">
        {sessionStatus === 'waiting' ? (
          <div className="empty-chat text-center text-muted p-4">
            <p>Setting up your secure consultation session...</p>
            <div className="spinner-border text-secondary mt-2" />
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">
            <h4>⚖️ Your Secure Legal Consultation</h4>
            <p>This is a private, encrypted conversation with your attorney.</p>
            <p>All communications are confidential and protected.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`legal-message ${msg.senderId === currentUser.id ? 'sent' : 'received'}`}>
              <div className="message-meta">
                <span className="message-sender">{msg.sender}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {sessionStatus === 'active' ? (
        <form onSubmit={handleSendMessage} className="legal-chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!socketConnected}
          />
          <button type="submit" disabled={!message.trim() || !socketConnected}>
            Send
          </button>
        </form>
      ) : sessionStatus === 'expired' ? (
        <div className="session-ended text-center p-3">
          <p>This consultation session has ended.</p>
        </div>
      ) : null}
    </div>
  );
};

export default ChatBox;
