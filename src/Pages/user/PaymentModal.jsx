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
  const [bookingAccepted, setBookingAccepted] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);

  const [internalShow, setInternalShow] = useState(show);

  const auth = useAuth();
  const currentUser = auth?.currentUser;

  const serviceDetails = {
    call: { price: lawyer?.consultation_fees || 10, icon: 'fa-phone', color: '#0d6efd', name: 'Phone Call' },
    chat: { price: lawyer?.consultation_fees || 10, icon: 'fa-comment-dots', color: '#198754', name: 'Chat' },
    video: { price: lawyer?.consultation_fees || 10, icon: 'fa-video', color: '#dc3545', name: 'Video Call' }
  };

  useEffect(() => {
    setInternalShow(show);
  }, [show]);

  useEffect(() => {
    const perMinute = serviceDetails[serviceType]?.price || 10;
    setPricePerMinute(perMinute);
    setTotal(duration * perMinute);
  }, [serviceType, duration]);

  const generateSessionToken = () => `session_${Math.random().toString(36).substring(2)}_${Date.now()}`;

  // ✅ Payment handler
  const handlePaymentSuccess = async (response) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = response;
    const token = generateSessionToken();
    setSessionToken(token);
    setPaymentSuccess(true);
    setBookingId(bookingId);

    const authToken = sessionStorage.getItem('token');

    try {
      const verifyRes = await fetch(
        'https://lawyerbackend-qrqa.onrender.com/lawapi/common/paymentverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
          body: JSON.stringify({ razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId })
        }
      );

      const verifyData = await verifyRes.json();
      if (!verifyData.error) {
        const userData = JSON.parse(sessionStorage.getItem('userData'));

        // ✅ Initialize socket only once
        const socket = initSocket(token, userData._id, 'client');

        // ✅ Listen for session start
        socket.on('session-started', (data) => {
          if (data.bookingId === bookingId) {
            console.log("Session started:", data);
            setBookingAccepted(true);
          }
        });

        // ✅ Join rooms
        socket.emit('join-user', userData._id);
        socket.emit('join-lawyer', verifyData.booking.lawyerId);
        socket.emit('join-booking', verifyData.booking._id);

        // Optional: fallback check
        socket.emit('check-session-status', { bookingId: verifyData.booking._id }, (resp) => {
          if (resp?.active) setBookingAccepted(true);
        });

        if (onPaymentSuccess) {
          onPaymentSuccess({ sessionToken: token, durationMinutes: duration, paymentId: razorpay_payment_id, bookingId });
        }
      } else {
        alert(`Payment verification failed: ${verifyData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Payment succeeded but verification failed.');
    }
  };

  const handlePayNow = async () => {
    setLoading(true);
    const authToken = sessionStorage.getItem('token');
    const service = serviceDetails[serviceType] || serviceDetails.call;

    try {
      const orderRes = await fetch(
        'https://lawyerbackend-qrqa.onrender.com/lawapi/common/createorder',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
          body: JSON.stringify({ lawyerId: lawyer?.lawyerId, mode: serviceType, amount: total * 100 })
        }
      );
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
        order_id: razorpayOrderId,
        handler: (response) => handlePaymentSuccess({ ...response, bookingId }),
        theme: { color: service.color }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Payment initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleHide = () => {
    setInternalShow(false);
    handleClose();
  };

  // ✅ Render ChatBox only after session + booking accepted
  const renderChat = () => {
    if (paymentSuccess && sessionToken && bookingAccepted && bookingId && currentUser?._id) {
      return (
        <ChatBox
          sessionToken={sessionToken}
          chatDuration={duration}
          lawyer={lawyer}
          bookingId={bookingId}
          role="client"
          currentUser={currentUser}
        />
      );
    }
    if (paymentSuccess) {
      return (
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="text-muted">🔄 Waiting for lawyer to accept the session...</div>
        </div>
      );
    }
    return null;
  };

  return (
    <Modal show={internalShow} onHide={handleHide} centered fullscreen={paymentSuccess}>
      {!paymentSuccess && (
        <>
          <Modal.Header closeButton style={{ background: '#1c1c84', color: 'white' }}>
            <Modal.Title>
              <i className={`fas ${serviceDetails[serviceType]?.icon} me-2`}></i>
              {serviceDetails[serviceType]?.name || 'Consultation'} Payment
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="duration" className="mb-4">
                <Form.Label>Duration</Form.Label>
                <Form.Select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {[15, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}
                </Form.Select>
              </Form.Group>
              <div>
                <p>Rate: ₹{pricePerMinute}/min</p>
                <p>Total: ₹{total}</p>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleHide}>Cancel</Button>
            <Button variant="primary" onClick={handlePayNow} disabled={loading}>
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>
          </Modal.Footer>
        </>
      )}

      {paymentSuccess && renderChat()}
    </Modal>
  );
};

export default PaymentModal;
