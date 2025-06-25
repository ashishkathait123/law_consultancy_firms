import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';

const ChatBox = ({ sessionToken, chatDuration, lawyer, bookingId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [remainingTime, setRemainingTime] = useState(chatDuration * 60);
  const [sessionStatus, setSessionStatus] = useState('active');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const auth = useAuth();
  const currentUser = auth?.currentUser;

  const fileIcons = {
    pdf: '📄',
    docx: '📝',
    doc: '📝',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    txt: '📋'
  };
const VITE_CHAT_SERVER ="https://lawyerbackend-qrqa.onrender.com";
  // Initialize socket connection
  useEffect(() => {
    if (!sessionToken || !currentUser || !bookingId) return;

    socketRef.current = io(VITE_CHAT_SERVER, {
      auth: { token: sessionToken },
      query: {
        userId: currentUser.id,
        userType: 'client'
      },
      path: '/socket.io'
    });

    // Join booking room
    socketRef.current.emit('join-booking', bookingId);

    // Listen for messages
    socketRef.current.on('new-message', (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
    });

    socketRef.current.on('session-time', ({ remaining }) => {
      setRemainingTime(remaining);
    });

    socketRef.current.on('session-ended', () => {
      setSessionStatus('expired');
      alert('Your chat session has ended.');
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Connection error:', err);
      alert('Connection to chat server failed');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [sessionToken, currentUser, chatDuration, bookingId]);

  // Timer countdown
  useEffect(() => {
    if (remainingTime <= 0) {
      setSessionStatus('expired');
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime]);

  useEffect(() => {
    if (remainingTime === 300) {
      alert('Your chat session will expire in 5 minutes.');
    } else if (remainingTime === 60) {
      alert('Your chat session will expire in 1 minute.');
    }
  }, [remainingTime]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || sessionStatus !== 'active') return;

    const newMessage = {
      id: uuidv4(),
      sender: currentUser.name,
      senderId: currentUser.id,
      content: message,
      type: 'text',
      bookingId
    };

    socketRef.current.emit('chat-message', newMessage);

    setMessages(prev => [...prev, {
      ...newMessage,
      timestamp: new Date().toISOString()
    }]);
    setMessage('');
    scrollToBottom();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || sessionStatus !== 'active') return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/png',
      'image/jpeg',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionToken', sessionToken);
    formData.append('userId', currentUser.id);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${currentUser.token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      const fileMessage = {
        id: uuidv4(),
        sender: currentUser.name,
        senderId: currentUser.id,
        content: response.data.fileName,
        fileUrl: response.data.fileUrl,
        fileType: response.data.fileType,
        type: 'file',
        bookingId
      };

      socketRef.current.emit('file-uploaded', fileMessage);

      setMessages(prev => [...prev, {
        ...fileMessage,
        timestamp: new Date().toISOString()
      }]);
      scrollToBottom();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('File upload failed.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleEndSession = () => {
    if (window.confirm('End session?')) {
      socketRef.current.emit('end-session', sessionToken);
      setSessionStatus('expired');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    return fileIcons[ext] || '📁';
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h4>Chat with {lawyer?.name}</h4>
        <span>Time left: {formatTime(remainingTime)}</span>
        <button onClick={handleEndSession}>End Session</button>
      </div>

      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.senderId === currentUser.id ? 'sent' : 'received'}`}>
            <strong>{msg.sender}</strong>
            {msg.type === 'text' ? (
              <p>{msg.content}</p>
            ) : (
              <p>
                {getFileIcon(msg.content)}{' '}
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">{msg.content}</a>
              </p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <form onSubmit={handleSendMessage} className="chat-input">
        <input
          type="text"
          value={message}
          placeholder="Type a message..."
          onChange={(e) => setMessage(e.target.value)}
          disabled={sessionStatus !== 'active'}
        />
        <button type="submit">Send</button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
        <button type="button" onClick={() => fileInputRef.current.click()}>📎</button>
        {isUploading && <span>{uploadProgress}% uploading...</span>}
      </form>
    </div>
  );
};

export default ChatBox;
