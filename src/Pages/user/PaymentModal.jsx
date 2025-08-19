import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import ChatBox from '../../components/ChatBox';
import { initSocket, getSocket } from '../../components/socket';
import { useAuth } from '../../components/AuthContext';

const PaymentModal = ({ show, handleClose, serviceType, lawyer, onPaymentSuccess }) => {
  const [duration, setDuration] = useState(15);
  const [pricePerMinute, setPricePerMinute] = useState(10);
  const [total, setTotal] = useState(150);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);
  const [internalShow, setInternalShow] = useState(show);
  const [bookingAccepted, setBookingAccepted] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [chatReady, setChatReady] = useState(false);

  const auth = useAuth();
  const currentUser = auth?.currentUser;

  const serviceDetails = {
  call: {
    price: lawyer?.consultation_fees || 10,   // single fee applies to all
    icon: 'fa-phone',
    color: '#0d6efd',
    name: 'Phone Call'
  },
  chat: {
    price: lawyer?.consultation_fees || 10,
    icon: 'fa-comment-dots',
    color: '#198754',
    name: 'Chat'
  },
  video: {
    price: lawyer?.consultation_fees || 10,
    icon: 'fa-video',
    color: '#dc3545',
    name: 'Video Call'
  }
};

  useEffect(() => {
    const perMinute = serviceDetails[serviceType]?.price || 10;
    setPricePerMinute(perMinute);
    setTotal(duration * perMinute);
  }, [serviceType, duration]);

  useEffect(() => {
    setInternalShow(show);
  }, [show]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.onAny((event, ...args) => {
      console.log(`📡 [SOCKET EVENT] ${event}`, args);
    });
    return () => socket.offAny();
  }, []);

  const handleHide = () => {
    setInternalShow(false);
    handleClose();
  };

  const generateSessionToken = () => `session_${Math.random().toString(36).substring(2)}_${Date.now()}`;

  const handlePaymentSuccess = async (response) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = response;
    const token = generateSessionToken();
    setSessionToken(token);
    setPaymentSuccess(true);
    setBookingId(bookingId);

    const authToken = sessionStorage.getItem('token');

    try {
      const verifyRes = await fetch('https://lawyerbackend-qrqa.onrender.com/lawapi/common/paymentverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          bookingId
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.error) {
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        const socket = initSocket(token, userData.userId, 'client');

        if (socket && userData) {
          socket.on('session-started', (data) => {
            if (data.bookingId === bookingId) {
              console.log("✅ session-started confirmed by server:", data);
              setChatReady(true);
              setBookingAccepted(true);
            }
          });

          socket.emit('join-user', userData.userId);
          socket.emit('join-lawyer', verifyData.booking.lawyerId);
          socket.emit('join-booking', verifyData.booking._id);

          socket.emit('new-booking-notification', {
            bookingId: verifyData.booking._id,
            userId: userData.userId,
            userName: userData.name || 'User',
            lawyerId: verifyData.booking.lawyerId,
            mode: serviceType,
            amount: verifyData.booking.amount,
            createdAt: verifyData.booking.createdAt
          });

          socket.emit('user-started-chat', {
            userId: userData.userId,
            lawyerId: verifyData.booking.lawyerId,
            bookingId: verifyData.booking._id,
            mode: serviceType
          });
        }

        if (onPaymentSuccess) {
onPaymentSuccess({
  sessionToken: token,
  durationMinutes: duration,
  paymentId: razorpay_payment_id,
  bookingId: bookingId,  // ✅ ADD THIS
});
        }
      } else {
        alert(`Payment verification failed: ${verifyData.message}`);
      }
    } catch (err) {
      console.error('Verification Error:', err);
      alert('Payment succeeded but verification failed.');
    }
  };

  const handlePayNow = async () => {
    setLoading(true);
    const authToken = sessionStorage.getItem('token');
    const service = serviceDetails[serviceType] || serviceDetails.call;

    try {
      const orderRes = await fetch('https://lawyerbackend-qrqa.onrender.com/lawapi/common/createorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ lawyerId: lawyer?.lawyerId, mode: serviceType })
      });

      const orderData = await orderRes.json();
      const razorpayOrderId = orderData?.order?.id;
      const bookingId = orderData?.booking?._id;

      if (!razorpayOrderId || !bookingId) {
        alert("Failed to create order.");
        return;
      }

      const options = {
        key: 'rzp_test_mcwl3oaRQerrOW',
        amount: total * 100,
        currency: 'INR',
        name: `${service.name} with ${lawyer?.name}`,
        description: `${service.name} consultation (${duration} mins)`,
        image: '/logo.png',
        order_id: razorpayOrderId,
        handler: (response) => handlePaymentSuccess({ ...response, bookingId }),
        prefill: {
          name: 'User',
          email: 'user@example.com',
          contact: '9999999999'
        },
        notes: {
          lawyerId: lawyer?.lawyerId || 'Unknown',
          service: serviceType,
          duration,
          lawyerName: lawyer?.name || 'Unknown'
        },
        theme: { color: service.color }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Waiting screen
  if (paymentSuccess && serviceType === 'chat' && !bookingAccepted) {
    return (
      <Modal show={internalShow} onHide={handleHide} centered>
        <Modal.Body className="text-center py-5">
          <div className="spinner-border text-primary mb-3"></div>
          <h5>Waiting for lawyer to accept the session...</h5>
        </Modal.Body>
      </Modal>
    );
  }

  // ✅ Chat ready
  if (paymentSuccess && sessionToken && serviceType === 'chat' && bookingAccepted) {
    console.log('🔍 Render Check:', { sessionToken, bookingId, lawyer, duration, currentUser });
    return (
      <Modal show={internalShow} onHide={handleHide} centered fullscreen>
        <Modal.Header closeButton style={{ background: '#1c1c84', color: 'white' }}>
          <Modal.Title>
            <i className={`fas ${serviceDetails[serviceType]?.icon} me-2`}></i>
            Chat Session with {lawyer?.name}
          </Modal.Title>
        </Modal.Header>
       <Modal.Body style={{ padding: 0, height: '100vh', overflow: 'hidden' }}>
  {sessionToken && bookingId && lawyer && duration && currentUser?._id ? (
 
 <ChatBox
  sessionToken={sessionToken}
  chatDuration={duration}
  lawyer={lawyer}
  bookingId={bookingId}
  role="client"
  currentUser={currentUser}
    authToken={sessionStorage.getItem('token')} // ✅ This is the JWT

/>


  ) : (
    <div className="d-flex justify-content-center align-items-center h-100">
      <div className="text-muted">🔄 Setting up secure chat...</div>
    </div>
    
  )}
  
</Modal.Body>

      </Modal>
    );
  }

  // Payment UI
  return (
    <Modal show={internalShow} onHide={handleHide} centered>
      <Modal.Header closeButton style={{ background: '#1c1c84', color: 'white' }}>
        <Modal.Title>
          <i className={`fas ${serviceDetails[serviceType]?.icon} me-2`}></i>
          {serviceDetails[serviceType]?.name || 'Consultation'} Payment
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center mb-3">
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: `${serviceDetails[serviceType]?.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <i className={`fas ${serviceDetails[serviceType]?.icon} fa-2x`} style={{ color: serviceDetails[serviceType]?.color }}></i>
            </div>
          </div>
          <h5>Consultation with {lawyer?.name}</h5>
          <p className="text-muted">{lawyer?.specialization}</p>
        </div>

        <Form>
          <Form.Group controlId="duration" className="mb-4">
            <Form.Label>Duration</Form.Label>
            <Form.Select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ borderRadius: '20px', padding: '10px' }}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </Form.Select>
          </Form.Group>

          <div className="p-4 mb-3" style={{
            background: '#f8f9fa', borderRadius: '10px',
            borderLeft: `4px solid ${serviceDetails[serviceType]?.color}`
          }}>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Rate:</span>
              <span>₹{pricePerMinute} per minute</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Duration:</span>
              <span>{duration} minutes</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between">
              <strong>Total Amount:</strong>
              <strong className="h5" style={{ color: serviceDetails[serviceType]?.color }}>₹{total}</strong>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleHide} style={{ borderRadius: '20px', padding: '8px 20px' }}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handlePayNow}
          disabled={loading}
          style={{
            background: serviceDetails[serviceType]?.color,
            border: 'none',
            borderRadius: '20px',
            padding: '8px 20px',
            minWidth: '100px'
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : 'Pay Now'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;
