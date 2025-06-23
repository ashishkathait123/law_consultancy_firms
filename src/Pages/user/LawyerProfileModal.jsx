import React from 'react';
import { useState } from 'react';
import { Modal, Button, Tab, Tabs } from 'react-bootstrap';
import PaymentModal from './PaymentModal';

const LawyerProfileModal = ({ show, handleClose, lawyer }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleOpenPayment = (serviceType) => {
    setSelectedService(serviceType);
    setShowPaymentModal(true);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton style={{ background: '#1E4D7A', color: 'white' }}>
        <Modal.Title>Lawyer Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0' }}>
        <div className="row m-0">
          {/* Left section */}
          <div className="col-12 col-md-4 text-center p-4" style={{ background: '#f8f9fa' }}>
            <div className="lawyer-avatar">
              {lawyer?.photo ? (
                <img src={lawyer.photo} alt={lawyer.name} />
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

              <span className="specialization-badge">
                <i className="fas fa-certificate icon"></i> {lawyer?.licenseNumber}
              </span>
            </div>
            
            <div className="lawyer-location">
              <i className="fas fa-map-marker-alt"></i>
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
                      <li>
                        <i className="fas fa-graduation-cap text-primary me-2"></i>
                        <span><strong>Education:</strong> {lawyer?.education || 'LLB and LLM'}</span>
                      </li>
                      <li>
                        <i className="fas fa-language text-primary me-2"></i>
                        <span><strong>Languages:</strong> {lawyer?.languages?.join(', ') || 'English, Hindi'}</span>
                      </li>
                      <li>
                        <i className="fas fa-money-bill-wave text-primary me-2"></i>
                        <span><strong>Consultation Fee:</strong> ₹{lawyer?.consultationFee || '500'}/hr</span>
                      </li>
                      <li>
                        <i className="fas fa-clock text-primary me-2"></i>
                        <span><strong>Availability:</strong> {lawyer?.availability || 'Mon-Fri, 9AM-6PM'}</span>
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
            </Tabs>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="flex-column flex-md-row justify-content-between align-items-center" style={{ borderTop: 'none' }}>
        <div className="d-flex flex-wrap gap-2 mb-2 mb-md-0">
          <Button 
            variant="outline-primary" 
            onClick={() => handleOpenPayment('call')}
            style={{ borderRadius: '20px', padding: '8px 16px' }}
          >
            <i className="fas fa-phone me-2"></i> Call
          </Button>
          <Button 
            variant="outline-success" 
            onClick={() => handleOpenPayment('chat')}
            style={{ borderRadius: '20px', padding: '8px 16px' }}
          >
            <i className="fas fa-comment-dots me-2"></i> Chat
          </Button>
          <Button 
            variant="outline-danger" 
            onClick={() => handleOpenPayment('video')}
            style={{ borderRadius: '20px', padding: '8px 16px' }}
          >
            <i className="fas fa-video me-2"></i> Video Call
          </Button>
        </div>
        <Button 
          variant="primary" 
          onClick={handleClose}
          style={{ background: '#1E4D7A', border: 'none', borderRadius: '20px', padding: '8px 20px' }}
        >
          Close
        </Button>
      </Modal.Footer>
      
      {showPaymentModal && (
        <PaymentModal
          show={showPaymentModal}
          handleClose={() => setShowPaymentModal(false)}
          serviceType={selectedService}
          lawyer={lawyer}
        />
      )}
    </Modal>
  );
};

export default LawyerProfileModal;

<style jsx>{`
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
  
  .verified-badge {
    background: #28a745;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  
  .specialization-badge {
    background: #1E4D7A;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  
  .lawyer-location {
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
  
  .stars {
    color: #E8B63A;
    font-size: 1rem;
  }
  
  .years {
    font-size: 1.2rem;
    font-weight: bold;
    color: #1E4D7A;
  }
  
  .lawyer-details li {
    padding: 8px 0;
    border-bottom: 1px solid #f1f1f1;
  }
`}</style>