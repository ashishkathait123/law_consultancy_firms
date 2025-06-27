// Merged LawyerDashboard.jsx with socket integration, profile, stats, and notification modal

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  useTheme,
  Button,
  Paper,
  Avatar,
  Divider,
  Chip
} from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Person as PersonIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  MonetizationOn as MonetizationOnIcon,
  LocationOn as LocationOnIcon,
  Star as StarIcon
} from "@mui/icons-material";
import { Modal } from 'react-bootstrap';
import { io } from 'socket.io-client';
import Header from "./Header";
import Stats from "./Stats";
import Livechat from "./liveChate";

const useLawyerData = () => {
  const [data, setData] = useState({
    lawyer: null,
    stats: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const profileRes = await axios.get(
          "https://lawyerbackend-qrqa.onrender.com/lawapi/auth/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const lawyerData = profileRes.data.data;

        setData({
          lawyer: lawyerData,
          stats: {
            appointments: 0,
            clients: 0,
            revenue: {
              monthly: 0,
              daily: lawyerData.consultation_fees
            },
            pending: 0,
            rating: 4.7
          },
          loading: false,
          error: null
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.message || error.message
        }));
        toast.error("Failed to load dashboard data");
      }
    };

    fetchData();
  }, []);

  return data;
};

const NotificationModal = ({ show, onClose, data, socket }) => {
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
        <Button variant="contained" color="error" onClick={onClose}>Reject</Button>
        <Button variant="contained" color="success" onClick={() => {
          if (socket && data.bookingId) {
            socket.emit('accept-request', { bookingId: data.bookingId });
          }
          onClose();
        }}>Accept</Button>
      </Modal.Footer>
    </Modal>
  );
};

const ProfileCard = ({ lawyer, stats }) => {
  const theme = useTheme();
  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
      <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
        <Avatar sx={{ width: 120, height: 120, fontSize: 50, bgcolor: theme.palette.primary.main, mb: 2 }}>
          {lawyer.name.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h5" fontWeight="bold">{lawyer.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary">{lawyer.specialization}</Typography>
        <Box display="flex" alignItems="center" mt={1}>
          <StarIcon color="warning" />
          <Typography variant="body1" ml={0.5}>{stats.rating} ({Math.floor(stats.rating * 20)} reviews)</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="h6" gutterBottom fontWeight="bold">Professional Information</Typography>
        <Box display="flex" alignItems="center" mb={1.5}>
          <WorkIcon color="primary" sx={{ mr: 1.5 }} />
          <Box>
            <Typography variant="body1">{lawyer.experience} years experience</Typography>
            <Typography variant="caption" color="text.secondary">License: {lawyer.licenseNumber}</Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" mb={1.5}>
          <MonetizationOnIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="body1">Consultation fee: ₹{lawyer.consultation_fees}</Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={1.5}>
          <Chip label={lawyer.status} color={lawyer.status === 'online' ? 'success' : 'default'} size="small" sx={{ mr: 1.5 }} />
          <Typography variant="body2">{lawyer.status === 'online' ? 'Available' : 'Not available'}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="h6" gutterBottom fontWeight="bold">Contact Information</Typography>
        <Box display="flex" alignItems="center" mb={1.5}>
          <EmailIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="body1">{lawyer.email}</Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={1.5}>
          <PhoneIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="body1">+{lawyer.phone}</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <LocationOnIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="body1">{lawyer.city}{lawyer.addressline ? `, ${lawyer.addressline}` : ''}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const LawyerDashboard = () => {
  const theme = useTheme();
  const { lawyer, stats, loading, error } = useLawyerData();
  const [notificationData, setNotificationData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

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

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      setConnected(true);
      socket.emit('join-lawyer', userData.userId);
    });

    socket.on('joined-lawyer-room', ({ lawyerId }) => {
      console.log(`✅ Joined lawyer room: ${lawyerId}`);
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Socket disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
    });

    socket.on('booking-notification', (data) => {
      console.log('📬 Booking notification received:', data);
      setNotificationData(data);
      setShowModal(true);
    });

    socket.on('incoming-session-request', (data) => {
      console.log('📬 Incoming session request:', data);
      setNotificationData(data);
      setShowModal(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userData");
    toast.success("Logged out successfully!");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4} textAlign="center">
        <Typography variant="h6" color="error" gutterBottom>
          Error loading dashboard: {error}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => window.location.reload()}>Retry</Button>
      </Box>
    );
  }

  if (!lawyer) {
    return (
      <Box mt={4} textAlign="center">
        <Typography variant="h6" color="error">Lawyer profile not found. Please login again.</Typography>
        <Button variant="text" color="primary" onClick={handleLogout} sx={{ mt: 2 }}>Go to Login</Button>
      </Box>
    );
  }

  return (
    <Paper sx={{ minHeight: "100vh", borderRadius: 0 }}>
      <Livechat />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Header lawyerName={lawyer.name} onLogout={handleLogout} />
        <Stats stats={stats} theme={theme} />
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={5} lg={4}>
            <ProfileCard lawyer={lawyer} stats={stats} />
          </Grid>
          <Grid item xs={12} md={7} lg={8}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">Additional dashboard content will appear here</Typography>
            </Paper>
          </Grid>
        </Grid>
        <NotificationModal show={showModal} onClose={() => setShowModal(false)} data={notificationData} socket={socketRef.current} />
      </Box>
    </Paper>
  );
};

export default LawyerDashboard;
