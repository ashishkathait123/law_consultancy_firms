import React, { useState } from 'react';
import { Modal, Button, Tab, Tabs } from 'react-bootstrap';
import PaymentModal from './PaymentModal';
import { FaUserTie, FaStar, FaMapMarkerAlt, FaGraduationCap, FaLanguage, FaMoneyBillWave, FaClock, FaPhone, FaCommentDots, FaVideo, FaCheckCircle, FaTimesCircle, FaCertificate } from 'react-icons/fa';

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

  // Construct the image URL if available
  const lawyerImageUrl = lawyer?.lawyerImage 
    ? `https://lawyerbackend-qrqa.onrender.com${lawyer.lawyerImage}`
    : null;

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
                {lawyerImageUrl ? (
                  <img 
                    src={lawyerImageUrl} 
                    alt={lawyer?.name || 'Lawyer'} 
                    className="img-fluid rounded-circle"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <FaUserTie size={50} color="#1E4D7A" />
                  </div>
                )}
              </div>
              
              <h4 className="lawyer-name">{lawyer?.name}</h4>
              <p className="lawyer-title">{lawyer?.specialization}</p>
              
              <div className="rating-experience">
                <div className="rating">
                  <div className="stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar
                        key={i}
                        color={i < (lawyer?.rating || 0) ? '#E8B63A' : '#6c757d'}
                      />
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
                  {lawyer?.isverified ? <FaCheckCircle /> : <FaTimesCircle />}
                  {lawyer?.isverified ? 'Verified' : 'Not Verified'}
                </span>

                <span className="specialization-badge badge bg-primary d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill text-white">
                  <FaCertificate /> {lawyer?.licenseNumber}
                </span>
              </div>
              
              <div className="lawyer-location">
                <FaMapMarkerAlt className="me-2" />
                {lawyer?.city}, {lawyer?.state}
              </div>
            </div>

            {/* Right section */}
            <div className="col-12 col-md-8 p-4">
              <Tabs defaultActiveKey="profile" className="mb-3" fill>
                <Tab eventKey="profile" title="Profile">
                  <div className="mt-3">
                    <h5 style={{ color: '#1E4D7A' }}>About</h5>
                    <p style={{ color: '#444' }}>{lawyer?.profileDescription || 'No profile description available'}</p>

                    <div className="lawyer-details">
                      <h5 style={{ color: '#1E4D7A', marginBottom: '15px' }}>Details</h5>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <FaGraduationCap className="text-primary me-2" />
                          <span><strong>Education:</strong> {lawyer?.education?.join(', ') || 'Not specified'}</span>
                        </li>
                        <li className="mb-2">
                          <FaLanguage className="text-primary me-2" />
                          <span><strong>Languages:</strong> English</span>
                        </li>
                        <li className="mb-2">
                          <FaMoneyBillWave className="text-primary me-2" />
                          <span><strong>Consultation Fee:</strong> ₹{lawyer?.consultation_fees || '500'}/hr</span>
                        </li>
                        <li className="mb-2">
                          <FaClock className="text-primary me-2" />
                          <span><strong>Availability:</strong> {lawyer?.status || 'Not specified'}</span>
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
                              <FaStar
                                key={i}
                                color={i < review.rating ? '#E8B63A' : '#6c757d'}
                              />
                            ))}
                          </div>
                          <p className="mb-0" style={{ color: '#444' }}>{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <FaCommentDots size={48} className="text-muted mb-3" />
                        <p style={{ color: '#666' }}>No reviews yet</p>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="services" title="Services">
                  <div className="mt-3">
                    <div className="service-card mb-3 p-3 border rounded">
                      <div className="d-flex align-items-center mb-2">
                        <FaCommentDots className="text-success me-3" size={24} />
                        <div>
                          <h5 style={{ color: '#1E4D7A', marginBottom: '5px' }}>Chat Consultation</h5>
                          <p style={{ color: '#666', marginBottom: '0' }}>
                            Instant text chat with {lawyer?.name?.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="text-muted">Starting at ₹{lawyer?.consultation_fees || '500'}/30 min</span>
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
                        <FaPhone className="text-primary me-3" size={24} />
                        <div>
                          <h5 style={{ color: '#1E4D7A', marginBottom: '5px' }}>Phone Consultation</h5>
                          <p style={{ color: '#666', marginBottom: '0' }}>
                            Scheduled phone call with {lawyer?.name?.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="text-muted">Starting at ₹{(lawyer?.consultation_fees || 500) + 300}/30 min</span>
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
                        <FaVideo className="text-danger me-3" size={24} />
                        <div>
                          <h5 style={{ color: '#1E4D7A', marginBottom: '5px' }}>Video Consultation</h5>
                          <p style={{ color: '#666', marginBottom: '0' }}>
                            Face-to-face video meeting with {lawyer?.name?.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="text-muted">Starting at ₹{(lawyer?.consultation_fees || 500) + 500}/30 min</span>
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
              <FaPhone className="me-2" /> Call
            </Button>
            <Button 
              variant="outline-success" 
              onClick={() => handleOpenPayment('chat')}
              className="d-flex align-items-center"
            >
              <FaCommentDots className="me-2" /> Chat
            </Button>
            <Button 
              variant="outline-danger" 
              onClick={() => handleOpenPayment('video')}
              className="d-flex align-items-center"
            >
              <FaVideo className="me-2" /> Video
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
              <FaCommentDots className="me-2" />
              Chat with {lawyer?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center py-4">
              <h4>Chat session initialized</h4>
              <p>You can now chat with {lawyer?.name} for {activeSession.duration} minutes</p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleChatClose}>
              End Chat
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default LawyerProfileModal;