import React, { useState } from 'react';
import axios from 'axios';

import { FaGavel, FaCheckCircle, FaMapMarkerAlt, FaCertificate, FaGraduationCap, FaLanguage, FaUserTie } from 'react-icons/fa';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { FaCircle } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled, { keyframes } from 'styled-components';

// Pulse animation for online status
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
`;

const OnlineIndicator = styled(FaCircle)`
  color: #28a745;
  font-size: 0.8rem;
  margin-right: 5px;
  animation: ${pulse} 2s infinite;
`;

const OfflineIndicator = styled(FaCircle)`
  color: #6c757d;
  font-size: 0.8rem;
  margin-right: 5px;
`;

const LawyerCard = ({ lawyer, onViewProfile }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
 const [requestForm, setRequestForm] = useState({
  message: ''
});

  const isOnline = lawyer.status === 'online';

const handleRequestSubmit = async (e) => {
  e.preventDefault();

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const userId = userData.userId;

  if (!userId) {
    toast.error("User is not logged in. Please log in first.");
    return;
  }

  const payload = {
    lawyerId: lawyer.lawyerId || lawyer._id,
    userId,
    message: requestForm.message.trim()
  };

  try {
    console.log("Sending payload:", payload);
    await axios.post("https://lawyerbackend-qrqa.onrender.com/lawapi/common/sendlawyerrequest", payload);
    toast.success("Your request has been submitted successfully!");
    setShowRequestModal(false);
    setRequestForm({ message: "" });
  } catch (error) {
    console.error("Request submission error:", error);
    toast.error(error.response?.data?.message || "Failed to submit request.");
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderRating = () => {
    if (!lawyer.rating) return 'No ratings yet';
    return (
      <>
        {lawyer.rating.toFixed(1)} <small className="text-muted">/5.0</small>
      </>
    );
  };

  const renderStars = () => {
    const stars = [];
    const rating = Math.round(lawyer.rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-warning" />
        ) : (
          <FaStarHalfAlt key={i} className="text-warning" />
        )
      );
    }
    return stars;
  };

  return (
    <div className="lawyer-card">
      <div className="card-header">
        <span className="specialization-badge">
          <FaGavel className="icon" /> {lawyer.specialization}
        </span>
        <div className="status-container">
          {isOnline ? (
            <>
              <OnlineIndicator />
              <span className="status-text">Online</span>
            </>
          ) : (
            <>
              <OfflineIndicator />
              <span className="status-text">Offline</span>
            </>
          )}
          {lawyer.isVerified && (
            <span className="verified-badge">
              <FaCheckCircle className="icon" /> Verified
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="lawyer-avatar">
          {lawyer.profileImage ? (
            <img src={lawyer.profileImage} alt={lawyer.name} />
          ) : (
            <div className="avatar-placeholder">
              <FaUserTie className="icon" />
            </div>
          )}
        </div>

        <h3 className="lawyer-name">{lawyer.name}</h3>
        <p className="lawyer-title">{lawyer.title || 'Legal Professional'}</p>

        <div className="lawyer-location">
          <FaMapMarkerAlt className="icon" />
          <span>{lawyer.city}, {lawyer.state}</span>
        </div>

        <div className="rating-experience">
          <div className="rating">
            <div className="stars">{renderStars()}</div>
            <div className="rating-text">{renderRating()}</div>
          </div>
          <div className="experience">
            <div className="years">{lawyer.experience}+ years</div>
            <div className="label">Experience</div>
          </div>
        </div>

        <ul className="lawyer-details">
          <li>
            <FaCertificate className="icon" />
            <span>License: {lawyer.licenseNumber}</span>
          </li>
          <li>
            <FaGraduationCap className="icon" />
            <span>{lawyer.education || 'Law Degree'}</span>
          </li>
          {lawyer.languages && (
            <li>
              <FaLanguage className="icon" />
              <span>Speaks: {lawyer.languages.join(', ')}</span>
            </li>
          )}
        </ul>
<div className="action-buttons">
  <button 
    className="view-profile-btn"
    onClick={() => onViewProfile(lawyer)}
  >
    <FaUserTie className="icon" /> View Profile
  </button>

  {!isOnline && (
    <button 
      className="request-btn"
      onClick={() => setShowRequestModal(true)}
    >
      Send Request
    </button>
  )}
</div>


      </div>

      {/* Request Form Modal */}
      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Consultation</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRequestSubmit}>
        <Modal.Body>
  <p className="mb-4">You're sending a request to <strong>{lawyer.name}</strong>.</p>

  <Form.Group className="mb-3">
    <Form.Label>Your Message *</Form.Label>
    <Form.Control
      as="textarea"
      rows={4}
      name="message"
      required
      value={requestForm.message}
      onChange={(e) => setRequestForm({ message: e.target.value })}
      placeholder="Describe your legal issue..."
    />
  </Form.Group>
</Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRequestModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Request
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ToastContainer position="top-center" />

      <style>{`
        .lawyer-card {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .lawyer-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          padding: 12px 20px;
          background: #1E4D7A;
          color: white;
        }

        .status-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-text {
          font-size: 0.8rem;
          margin-right: 10px;
        }

        .specialization-badge {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .verified-badge {
          background: #28a745;
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .icon {
          font-size: 0.9rem;
        }

        .card-body {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .lawyer-avatar {
          width: 100px;
          height: 100px;
          margin: 0 auto 15px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #f8f9fa;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .lawyer-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f9fa;
          color: #1E4D7A;
          font-size: 2.5rem;
        }

        .lawyer-name {
          text-align: center;
          margin: 0 0 5px;
          color: #333;
          font-size: 1.2rem;
        }

        .lawyer-title {
          text-align: center;
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 15px;
        }

        .lawyer-location {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #666;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }

        .rating-experience {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }

        .rating {
          text-align: center;
        }

        .stars {
          color: #E8B63A;
          font-size: 0.9rem;
          margin-bottom: 3px;
        }

        .rating-text {
          font-size: 0.8rem;
          color: #666;
        }

        .experience {
          text-align: center;
        }

        .years {
          font-weight: bold;
          color: #1E4D7A;
          font-size: 1rem;
        }

        .label {
          font-size: 0.8rem;
          color: #666;
        }

        .lawyer-details {
          list-style: none;
          padding: 0;
          margin: 0 0 20px;
          flex: 1;
        }

        .lawyer-details li {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          font-size: 0.9rem;
          color: #444;
        }

        .lawyer-details .icon {
          color: #1E4D7A;
          min-width: 20px;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .view-profile-btn {
          background: #1E4D7A;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 5px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.3s;
          flex: 1;
        }

        .view-profile-btn:hover {
          background: #2a5f8f;
        }

        .chat-now-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 5px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s;
          flex: 1;
        }

        .chat-now-btn:hover {
          background: #218838;
        }

        .request-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 5px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s;
          flex: 1;
        }

        .request-btn:hover {
          background: #5a6268;
        }

        .view-profile-btn .icon,
        .chat-now-btn .icon,
        .request-btn .icon {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default LawyerCard;