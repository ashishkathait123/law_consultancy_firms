import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const PaymentModal = ({ show, handleClose, serviceType, lawyer }) => {
  const [duration, setDuration] = useState(15);
  const [pricePerMinute, setPricePerMinute] = useState(10);
  const [total, setTotal] = useState(150);
  const [loading, setLoading] = useState(false);

  // Service type details
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

  const handlePayNow = async () => {
    setLoading(true);
    
    try {
      const razorpayKey = 'rzp_test_mcwl3oaRQerrOW';
      const service = serviceDetails[serviceType] || serviceDetails.call;

      const options = {
        key: razorpayKey,
        amount: total * 100,
        currency: "INR",
        name: `${service.name} with ${lawyer?.name}`,
        description: `${service.name} consultation (${duration} mins)`,
        image: "/logo.png",
        handler: function (response) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          handleClose();
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999"
        },
        notes: {
          lawyerId: lawyer?.lawyerId || "Unknown",
          service: serviceType,
          duration: duration,
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
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <i 
                className={`fas ${serviceDetails[serviceType]?.icon} fa-2x`} 
                style={{ color: serviceDetails[serviceType]?.color }}
              ></i>
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
              <strong className="h5" style={{ color: serviceDetails[serviceType]?.color }}>
                ₹{total}
              </strong>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="outline-secondary" 
          onClick={handleClose}
          style={{ borderRadius: '20px', padding: '8px 20px' }}
        >
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

<style jsx>{`
  .payment-summary {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    border-left: 4px solid #1E4D7A;
  }
  
  .service-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }
  
  .duration-select {
    border-radius: 20px;
    padding: 10px 15px;
  }
  
  .total-amount {
    font-size: 1.2rem;
    color: #1E4D7A;
    font-weight: 600;
  }
`}</style>