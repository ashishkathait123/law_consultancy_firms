import React from 'react';
import { FaGavel, FaCheckCircle, FaMapMarkerAlt, FaCertificate, FaGraduationCap, FaLanguage, FaUserTie } from 'react-icons/fa';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

const LawyerCard = ({ lawyer, onViewProfile }) => {
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
        {lawyer.isVerified && (
          <span className="verified-badge">
            <FaCheckCircle className="icon" /> Verified
          </span>
        )}
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

        <button 
          className="view-profile-btn"
          onClick={() => onViewProfile(lawyer)}
        >
          <FaUserTie className="icon" /> View Full Profile
        </button>
      </div>

      <style jsx>{`
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
          width: 100%;
        }

        .view-profile-btn:hover {
          background: #2a5f8f;
        }

        .view-profile-btn .icon {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default LawyerCard;
