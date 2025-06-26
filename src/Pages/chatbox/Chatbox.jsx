import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './LawyerChatBox.css';
import { FaPaperclip, FaPaperPlane } from 'react-icons/fa';

const socket = io('https://your-socket-server.com');  // ✅ Replace with your Socket backend

function LawyerChatBox() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  const lawyerId = sessionStorage.getItem('lawyerId');

  // ✅ Fetch chat history from backend on first load
  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`https://your-api.com/api/chat/history/${lawyerId}`);
      const historyMessages = response.data.messages;  // Adjust this based on your API response
      setMessages(historyMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
   }
  };

  useEffect(() => {
    fetchChatHistory();
	
    socket.emit('joinLawyerRoom', { lawyerId });

    socket.on('messageFromUser', (data) => {
      setMessages((prev) => [...prev, { sender: 'user', type: 'text', text: data.message }]);
    });

    socket.on('fileFromUser', (data) => {
      setMessages((prev) => [...prev, { sender: 'user', type: 'file', fileName: data.fileName }]);
    });

    return () => socket.disconnect();
  }, [lawyerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('messageFromLawyer', { lawyerId, message: newMessage });
      setMessages((prev) => [...prev, { sender: 'lawyer', type: 'text', text: newMessage }]);
      setNewMessage('');
    }
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      socket.emit('fileFromLawyer', {
        lawyerId,
        fileName: selectedFile.name,
        fileData: selectedFile,  // You might want to convert fileData to Base64 or Blob on backend side
      });

      setMessages((prev) => [
        ...prev,
        { sender: 'lawyer', type: 'file', fileName: selectedFile.name },
      ]);
      setSelectedFile(null);
    }
  };

  return (
    <div className="chatbox-wrapper">
      {/* Header */}
      <div className="chat-header">
        <img src="/user-profile.jpg" alt="User" className="user-avatar" />
        <div>
          <h4 className="user-name">User Name</h4>
          <span className="user-status">Online</span>
        </div>
      </div>

      {/* Chat Body */}
      <div className="chat-body">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === 'lawyer' ? 'sent' : 'received'}`}
          >
            {msg.type === 'file' ? (
              <a href="#" className="file-link" download>
                📎 {msg.fileName}
              </a>
            ) : (
              <span>{msg.text}</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Footer */}
      <div className="chat-footer">
        <input
          type="file"
          id="fileInput"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
        <label htmlFor="fileInput" className="icon-button">
          {/* <FaPaperclip /> */}
        </label>

        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="message-input"
        />

        <button onClick={sendMessage} className="icon-button send-btn">
          <FaPaperPlane />
        </button>

        {selectedFile && (
          <button onClick={handleFileUpload} className="upload-btn">
            Upload
          </button>
        )}
      </div>
    </div>
  );
}

export default LawyerChatBox;
