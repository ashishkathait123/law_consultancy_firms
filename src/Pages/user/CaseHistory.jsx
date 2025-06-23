import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserTie, FaClock, FaMoneyBillWave, FaPhone, FaVideo, FaComments } from 'react-icons/fa';

const CaseHistory = () => {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const API_BASE = 'https://lawyerbackend-qrqa.onrender.com/lawapi';

  useEffect(() => {
    const fetchCaseHistory = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const user = JSON.parse(sessionStorage.getItem('userData'));

        if (!user?._id) {
          throw new Error("User ID not found in session");
        }

        const response = await axios.get(`${API_BASE}/client/cases/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCases(response.data.data || []);
      } catch (error) {
        console.error('Error fetching case history:', error);
        toast.error(error.message || 'Error loading case history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaseHistory();
  }, []);

  const filteredCases = filter === 'all' 
    ? cases 
    : cases.filter(caseItem => caseItem.status === filter);

  const getMediumIcon = (medium) => {
    switch (medium) {
      case 'call': return <FaPhone className="text-primary" />;
      case 'video': return <FaVideo className="text-danger" />;
      case 'chat': return <FaComments className="text-success" />;
      default: return <FaPhone className="text-primary" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-80">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-3 px-md-5">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="h4 mb-0">
                  <i className="fas fa-history me-2"></i>
                  My Case History
                </h2>
                <div className="btn-group">
                  <button 
                    className={`btn btn-sm ${filter === 'all' ? 'btn-light' : 'btn-outline-light'}`}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`btn btn-sm ${filter === 'completed' ? 'btn-light' : 'btn-outline-light'}`}
                    onClick={() => setFilter('completed')}
                  >
                    Completed
                  </button>
                  <button 
                    className={`btn btn-sm ${filter === 'ongoing' ? 'btn-light' : 'btn-outline-light'}`}
                    onClick={() => setFilter('ongoing')}
                  >
                    Ongoing
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              {filteredCases.length > 0 ? (
                <div className="list-group list-group-flush">
                  {filteredCases.map((caseItem, index) => (
                    <div key={index} className="list-group-item p-3 p-md-4 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="mb-1 text-primary">{caseItem.caseName || 'Legal Consultation'}</h5>
                        <span className={`badge ${caseItem.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                          {caseItem.status === 'completed' ? 'Completed' : 'Ongoing'}
                        </span>
                      </div>
                      
                      <div className="d-flex align-items-center mb-2">
                        <FaUserTie className="me-2 text-muted" />
                        <span className="text-muted">Lawyer:</span>
                        <span className="ms-2 fw-medium">{caseItem.lawyer?.name || 'Not specified'}</span>
                      </div>
                      
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <FaClock className="me-2 text-muted" />
                            <div>
                              <small className="text-muted">Consultation Time</small>
                              <div>{formatDate(caseItem.consultationTime)}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            {getMediumIcon(caseItem.consultationMedium)}
                            <div className="ms-2">
                              <small className="text-muted">Consultation Medium</small>
                              <div className="text-capitalize">{caseItem.consultationMedium || 'call'}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <FaMoneyBillWave className="me-2 text-muted" />
                            <div>
                              <small className="text-muted">Payment</small>
                              <div>₹{caseItem.paymentAmount || '0'}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-file-alt me-2 text-muted"></i>
                            <div>
                              <small className="text-muted">Case ID</small>
                              <div>{caseItem.caseId || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {caseItem.notes && (
                        <div className="mt-3">
                          <small className="text-muted">Notes:</small>
                          <div className="bg-light p-2 rounded">{caseItem.notes}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
                  <h5>No cases found</h5>
                  <p className="text-muted">Your case history will appear here once you have consultations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .list-group-item {
          transition: all 0.3s ease;
        }
        
        .list-group-item:hover {
          background-color: #f8f9fa;
        }
        
        .badge {
          font-size: 0.75rem;
          padding: 0.35em 0.65em;
          font-weight: 500;
        }
        
        @media (max-width: 767.98px) {
          .card-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .btn-group {
            margin-top: 10px;
            align-self: flex-end;
          }
        }
        
        @media (max-width: 575.98px) {
          .container-fluid {
            padding-left: 15px;
            padding-right: 15px;
          }
          
          .col-md-6 {
            margin-bottom: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default CaseHistory;