import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../components/AuthContext';
import './ChatBox.css';

const ChatBox = ({ sessionToken, chatDuration, lawyer, bookingId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [remainingTime, setRemainingTime] = useState(chatDuration * 60);
  const [sessionStatus, setSessionStatus] = useState('active');
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const auth = useAuth();
  const currentUser = auth?.currentUser;

  const SERVER_URL = "https://lawyerbackend-qrqa.onrender.com";

  useEffect(() => {
    if (!sessionToken || !currentUser || !bookingId) return;

    // Initialize socket connection
    if (!window.socket) {
      window.socket = io(SERVER_URL, {
        auth: { token: sessionToken },
        query: {
          userId: currentUser.id,
          userType: 'client',
        },
        path: '/socket.io',
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = window.socket;

    // Connection handlers
    socketRef.current.on('connect', () => {
      setSocketConnected(true);
      socketRef.current.emit('join-booking', bookingId);
    });

    socketRef.current.on('disconnect', () => {
      setSocketConnected(false);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setSocketConnected(false);
    });

    // Message handlers
    socketRef.current.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    socketRef.current.on('session-time', ({ remaining }) => {
      setRemainingTime(remaining);
    });

    socketRef.current.on('session-ended', () => {
      setSessionStatus('expired');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('new-message');
        socketRef.current.off('session-time');
        socketRef.current.off('session-ended');
      }
    };
  }, [sessionToken, currentUser, bookingId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      timestamp: new Date().toISOString(),
    };

    try {
      socketRef.current?.emit('chat-message', msg);
      setMessages((prev) => [...prev, msg]);
      setMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
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
      {/* Connection status indicator */}
      <div className={`connection-status ${socketConnected ? 'connected' : 'disconnected'}`}>
        {socketConnected ? (
          <span>✓ Connected</span>
        ) : (
          <span>⚠️ Connecting...</span>
        )}
      </div>

      {/* Chat header */}
      <div className="legal-chat-header">
        <div className="lawyer-profile">
          <div className="lawyer-avatar">
            {lawyer?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="lawyer-info">
            <h3>Consultation with {lawyer?.name}</h3>
            <p className="lawyer-title">{lawyer?.specialization || 'Attorney at Law'}</p>
          </div>
        </div>
        
        <div className="session-info">
          <div className="session-timer">
            <i className="icon-clock"></i> {formatTime(remainingTime)}
          </div>
          <div className={`session-status ${sessionStatus}`}>
            {sessionStatus === 'active' ? 'Session Active' : 'Session Ended'}
          </div>
          {sessionStatus === 'active' && (
            <button className="end-session-btn" onClick={handleEndSession}>
              End Session
            </button>
          )}
        </div>
      </div>

      {/* Chat messages */}
      <div className="legal-chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-icon">⚖️</div>
            <h4>Your Secure Legal Consultation</h4>
            <p>This is a private, encrypted conversation with your attorney.</p>
            <p>All communications are confidential and protected by attorney-client privilege.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`legal-message ${msg.senderId === currentUser.id ? 'sent' : 'received'}`}
            >
              <div className="message-meta">
                <span className="message-sender">{msg.sender}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Chat input */}
      {sessionStatus === 'active' ? (
        <form onSubmit={handleSendMessage} className="legal-chat-input">
          <div className="input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={!socketConnected}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={!message.trim() || !socketConnected}
            >
              Send
            </button>
          </div>
          <div className="security-notice">
            <i className="icon-lock"></i> Messages are encrypted and confidential
          </div>
        </form>
      ) : (
        <div className="session-ended">
          <p>This consultation session has ended.</p>
          <button className="request-new-session">
            Request New Consultation
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;