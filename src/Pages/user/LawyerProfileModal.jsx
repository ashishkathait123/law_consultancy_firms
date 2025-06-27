import React, { useState } from 'react';
import { Modal, Button, Tab, Tabs } from 'react-bootstrap';
import PaymentModal from './PaymentModal';
const LawyerProfileModal = ({ show, handleClose, lawyer }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [activeSession, setActiveSession] = useState(null);

  const handleOpenPayment = (serviceType) => {
    setSelectedService(serviceType);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentResult) => {
    setShowPaymentModal(false);
    if (selectedService === 'chat') {
      setActiveSession({
        sessionToken: paymentResult.sessionToken,
        duration: paymentResult.durationMinutes,
        lawyer: lawyer
      });
      setShowChatModal(true);
    } else {
      // Handle other service types (call/video)
      alert(`${selectedService} session scheduled!`);
      handleClose();
    }
  };

  const handleChatClose = () => {
    setShowChatModal(false);
    handleClose();
  };

  return (
    <>
      {/* Main Profile Modal */}
      <Modal 
        show={show && !showChatModal} 
        onHide={handleClose} 
        size="lg" 
        centered
        backdrop={showChatModal ? 'static' : true}
      >
        <Modal.Header closeButton style={{ background: '#1E4D7A', color: 'white' }}>
          <Modal.Title>Lawyer Profile</Modal.Title>
        </Modal.Header>
        
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0' }}>
          <div className="row m-0">
            {/* Left section */}
            <div className="col-12 col-md-4 text-center p-4" style={{ background: '#f8f9fa' }}>
              <div className="lawyer-avatar">
                {lawyer?.photo ? (
                  <img 
                    src={lawyer.photo} 
                    alt={lawyer.name} 
                    className="img-fluid rounded-circle"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <i className="fas fa-user-tie"></i>
                  </div>
                )}
              </div>
              
              <h4 className="lawyer-name">{lawyer?.name}</h4>
              <p className="lawyer-title">{lawyer?.specialization}</p>
              
              <div className="rating-experience">
                <div className="rating">
                  <div className="stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star ${i < (lawyer?.rating || 0) ? 'text-warning' : 'text-secondary'}`}
                      ></i>
                    ))}
                  </div>
                  <div className="rating-text">{lawyer?.reviews?.length || 0} reviews</div>
                </div>
                
                <div className="experience">
                  <div className="years">{lawyer?.experience || '0'}+</div>
                  <div className="label">Years Exp.</div>
                </div>
              </div>
              
              <div className="d-flex justify-content-center gap-2 mb-3">
                <span
                  className={`verified-badge badge ${
                    lawyer?.isverified ? 'bg-success' : 'bg-secondary'
                  } d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill text-white`}
                >
                  <i className={`fas fa-${lawyer?.isverified ? 'check-circle' : 'times-circle'}`}></i>
                  {lawyer?.isverified ? 'Verified' : 'Not Verified'}
                </span>

                <span className="specialization-badge badge bg-primary d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill text-white">
                  <i className="fas fa-certificate"></i> {lawyer?.licenseNumber}
                </span>
              </div>
              
              <div className="lawyer-location">
                <i className="fas fa-map-marker-alt me-2"></i>
                {lawyer?.city}, {lawyer?.state}
              </div>
            </div>

            {/* Right section */}
            <div className="col-12 col-md-8 p-4">
              <Tabs defaultActiveKey="profile" className="mb-3" fill>
                <Tab eventKey="profile" title="Profile">
                  <div className="mt-3">
                    <h5 style={{ color: '#1E4D7A' }}>About</h5>
                    <p style={{ color: '#444' }}>{lawyer?.bio || 'No bio available'}</p>

                    <div className="lawyer-details">
                      <h5 style={{ color: '#1E4D7A', marginBottom: '15px' }}>Details</h5>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="fas fa-graduation-cap text-primary me-2"></i>
                          <span><strong>Education:</strong> {lawyer?.education || 'Not specified'}</span>
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-language text-primary me-2"></i>
                          <span><strong>Languages:</strong> {lawyer?.languages?.join(', ') || 'English'}</span>
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-money-bill-wave text-primary me-2"></i>
                          <span><strong>Consultation Fee:</strong> ₹{lawyer?.consultationFee || '500'}/hr</span>
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-clock text-primary me-2"></i>
                          <span><strong>Availability:</strong> {lawyer?.availability || 'Not specified'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="reviews" title="Reviews">
                  <div className="mt-3">
                    {lawyer?.reviews?.length > 0 ? (
                      lawyer.reviews.map((review, index) => (
                        <div key={index} className="mb-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
                          <div className="d-flex justify-content-between align-items-center">
                            <strong style={{ color: '#1E4D7A' }}>{review.user}</strong>
                            <small className="text-muted">{new Date(review.date).toLocaleDateString()}</small>
                          </div>
                          <div className="my-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <i
                                key={i}
                                className={`fas fa-star ${i < review.rating ? 'text-warning' : 'text-secondary'}`}
                              ></i>
                            ))}
                          </div>
                          <p className="mb-0" style={{ color: '#444' }}>{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <i className="far fa-comment-dots fa-3x text-muted mb-3"></i>
                        <p style={{ color: '#666' }}>No reviews yet</p>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="services" title="Services">
                  <div className="mt-3">
                    <div className="service-card mb-3 p-3 border rounded">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-comment-dots text-success me-3 fa-2x"></i>
                        <div>
                          <h5 style={{ color: '#1E4D7A', marginBottom: '5px' }}>Chat Consultation</h5>
                          <p style={{ color: '#666', marginBottom: '0' }}>
                            Instant text chat with {lawyer?.name.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="text-muted">Starting at ₹{lawyer?.chatFee || '500'}/30 min</span>
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => handleOpenPayment('chat')}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>

                    <div className="service-card mb-3 p-3 border rounded">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-phone text-primary me-3 fa-2x"></i>
                        <div>
                          <h5 style={{ color: '#1E4D7A', marginBottom: '5px' }}>Phone Consultation</h5>
                          <p style={{ color: '#666', marginBottom: '0' }}>
                            Scheduled phone call with {lawyer?.name.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="text-muted">Starting at ₹{lawyer?.callFee || '800'}/30 min</span>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleOpenPayment('call')}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>

                    <div className="service-card p-3 border rounded">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-video text-danger me-3 fa-2x"></i>
                        <div>
                          <h5 style={{ color: '#1E4D7A', marginBottom: '5px' }}>Video Consultation</h5>
                          <p style={{ color: '#666', marginBottom: '0' }}>
                            Face-to-face video meeting with {lawyer?.name.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="text-muted">Starting at ₹{lawyer?.videoFee || '1000'}/30 min</span>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleOpenPayment('video')}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="flex-column flex-md-row justify-content-between align-items-center" style={{ borderTop: 'none' }}>
          <div className="d-flex flex-wrap gap-2 mb-2 mb-md-0">
            <Button 
              variant="outline-primary" 
              onClick={() => handleOpenPayment('call')}
              className="d-flex align-items-center"
            >
              <i className="fas fa-phone me-2"></i> Call
            </Button>
            <Button 
              variant="outline-success" 
              onClick={() => handleOpenPayment('chat')}
              className="d-flex align-items-center"
            >
              <i className="fas fa-comment-dots me-2"></i> Chat
            </Button>
            <Button 
              variant="outline-danger" 
              onClick={() => handleOpenPayment('video')}
              className="d-flex align-items-center"
            >
              <i className="fas fa-video me-2"></i> Video
            </Button>
          </div>
          <Button 
            variant="primary" 
            onClick={handleClose}
            style={{ background: '#1E4D7A', border: 'none' }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        handleClose={() => setShowPaymentModal(false)}
        serviceType={selectedService}
        lawyer={lawyer}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Chat Modal */}
      {showChatModal && activeSession && (
        <Modal 
          show={showChatModal} 
          onHide={handleChatClose} 
          size="lg" 
          centered
          fullscreen="md-down"
        >
          <Modal.Header closeButton style={{ background: '#1E4D7A', color: 'white' }}>
            <Modal.Title>
              <i className="fas fa-comment-dots me-2"></i>
              Chat with {lawyer?.name}
            </Modal.Title>
          </Modal.Header>
         
        </Modal>
      )}
    </>
  );
};

export default LawyerProfileModal;

// CSS Styles
const styles = `
  .lawyer-avatar {
    width: 120px;
    height: 120px;
    margin: 0 auto 20px;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e9ecef;
    color: #1E4D7A;
    font-size: 2.5rem;
  }
  
  .lawyer-name {
    color: #1E4D7A;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .lawyer-title {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 15px;
  }
  
  .rating-experience {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin: 20px 0;
    padding: 15px 0;
    border-top: 1px solid #dee2e6;
    border-bottom: 1px solid #dee2e6;
  }
  
  .rating {
    text-align: center;
  }
  
  .stars {
    color: #E8B63A;
    font-size: 1rem;
    margin-bottom: 5px;
  }
  
  .rating-text {
    font-size: 0.8rem;
    color: #6c757d;
  }
  
  .experience {
    text-align: center;
  }
  
  .years {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1E4D7A;
    line-height: 1;
  }
  
  .label {
    font-size: 0.8rem;
    color: #6c757d;
  }
  
  .lawyer-location {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .lawyer-details li {
    padding: 8px 0;
    border-bottom: 1px solid #f1f1f1;
    display: flex;
    align-items: center;
  }
  
  .service-card {
    transition: all 0.3s ease;
  }
  
  .service-card:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

// Add styles to the head
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);
