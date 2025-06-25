import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import ChatBox from '../../components/ChatBox';

const PaymentModal = ({ show, handleClose, serviceType, lawyer, onPaymentSuccess }) => {
  const [duration, setDuration] = useState(15);
  const [pricePerMinute, setPricePerMinute] = useState(10);
  const [total, setTotal] = useState(150);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);

  const serviceDetails = {
    call: { price: 10, icon: 'fa-phone', color: '#0d6efd', name: 'Phone Call' },
    chat: { price: 5, icon: 'fa-comment-dots', color: '#198754', name: 'Chat' },
    video: { price: 15, icon: 'fa-video', color: '#dc3545', name: 'Video Call' }
  };

  useEffect(() => {
    const perMinute = serviceDetails[serviceType]?.price || 10;
    setPricePerMinute(perMinute);
    setTotal(duration * perMinute);
  }, [serviceType, duration]);

  const generateSessionToken = () => `session_${Math.random().toString(36).substring(2)}_${Date.now()}`;

  const handlePaymentSuccess = async (response) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = response;

    console.log("✅ Razorpay Response:", response);

    const token = generateSessionToken();
    setSessionToken(token);
    setPaymentSuccess(true);

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

      const responseText = await verifyRes.text();
      console.log('🔍 Raw verification response:', responseText);

      let verifyData;
      try {
        verifyData = JSON.parse(responseText);
        console.log('✅ Parsed Payment verification:', verifyData);
      } catch (parseErr) {
        console.error('❌ Failed to parse verification JSON:', parseErr.message);
        alert('Invalid server response. Please contact support.');
        return;
      }

      if (verifyData.error) {
        console.error('❌ Payment verification error:', verifyData.message);
        alert(`Payment verification failed: ${verifyData.message}`);
        return;
      }

      if (onPaymentSuccess) {
        onPaymentSuccess({
          sessionToken: token,
          durationMinutes: duration,
          paymentId: razorpay_payment_id
        });
      }

    } catch (err) {
      console.error('❌ Payment verification failed:', err);
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
        body: JSON.stringify({
          lawyerId: lawyer?.lawyerId,
          mode: serviceType
        })
      });

      const orderData = await orderRes.json();
      console.log('📦 Order created:', orderData);

      const razorpayOrderId = orderData?.order?.id;
      const bookingId = orderData?.booking?._id;

      if (!razorpayOrderId || !bookingId) {
        alert("Failed to create order. Try again.");
        return;
      }

      const options = {
        key: 'rzp_test_mcwl3oaRQerrOW',
        amount: total * 100,
        currency: "INR",
        name: `${service.name} with ${lawyer?.name}`,
        description: `${service.name} consultation (${duration} mins)`,
        image: "/logo.png",
        order_id: razorpayOrderId,
        handler: (response) => {
          handlePaymentSuccess({ ...response, bookingId });
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9999999999"
        },
        notes: {
          lawyerId: lawyer?.lawyerId || "Unknown",
          service: serviceType,
          duration,
          lawyerName: lawyer?.name || "Unknown"
        },
        theme: {
          color: service.color
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong while initializing payment.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentSuccess && serviceType === 'chat') {
    return (
      <Modal show={show} onHide={handleClose} centered size="lg" fullscreen="md-down">
        <Modal.Header closeButton style={{ background: '#1E4D7A', color: 'white' }}>
          <Modal.Title>
            <i className={`fas ${serviceDetails[serviceType]?.icon} me-2`}></i>
            Chat Session with {lawyer?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0 }}>
          <ChatBox sessionToken={sessionToken} chatDuration={duration} lawyer={lawyer} />
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton style={{ background: '#1E4D7A', color: 'white' }}>
        <Modal.Title>
          <i className={`fas ${serviceDetails[serviceType]?.icon} me-2`}></i>
          {serviceDetails[serviceType]?.name || 'Consultation'} Payment
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center mb-3">
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `${serviceDetails[serviceType]?.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
            background: '#f8f9fa',
            borderRadius: '10px',
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
        <Button variant="outline-secondary" onClick={handleClose} style={{ borderRadius: '20px', padding: '8px 20px' }}>
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
          ) : (
            'Pay Now'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}; 

export default PaymentModal;
