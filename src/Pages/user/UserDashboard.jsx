import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageTitle from "../../components/PageTitle";

const UserDashboard = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    occupation: "",
    legalNeeds: [],
    cases: [],
    appointments: []
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE = "https://lawyerbackend-qrqa.onrender.com/lawapi";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const loggedUser = JSON.parse(sessionStorage.getItem("userData"));

        if (!loggedUser?._id) {
          throw new Error("User ID not found in session");
        }

        // Fetch profile data
        const profileResponse = await axios.get(`${API_BASE}/common/alluser`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allUsers = profileResponse.data.data;
        const currentUser = allUsers.find(user => user._id === loggedUser._id);

        if (currentUser) {
          setUserData(prev => ({
            ...prev,
            ...currentUser,
            legalNeeds: Array.isArray(currentUser.legalNeeds)
              ? currentUser.legalNeeds
              : [currentUser.legalNeeds].filter(Boolean)
          }));
        }

        // Fetch cases data (example - adjust endpoint as needed)
        const casesResponse = await axios.get(`${API_BASE}/cases/user/${loggedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(prev => ({ ...prev, cases: casesResponse.data.data || [] }));

        // Fetch appointments data (example - adjust endpoint as needed)
        const appointmentsResponse = await axios.get(`${API_BASE}/appointments/user/${loggedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(prev => ({ ...prev, appointments: appointmentsResponse.data.data || [] }));

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "Error loading data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-80">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <PageTitle page={"Client Dashboard"} />
      <div className="container-fluid py-4 px-3 px-md-5">
        <ToastContainer position="top-center" autoClose={3000} />
        
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header text-white py-3" style={{ backgroundColor: "#1E4D7A" }}>
                <h3 className="h5 mb-0">
                  <i className="fas fa-user-tie me-2"></i>
                  Client Overview
                </h3>
              </div>
              <div className="card-body text-center">
                <div className="avatar-container mx-auto mb-3">
                  <div className="avatar-placeholder bg-light-primary">
                    <i className="fas fa-user text-primary"></i>
                  </div>
                </div>
                <h4 className="mb-1">{userData.name}</h4>
                <p className="text-muted mb-3">{userData.email}</p>
                
                <div className="d-flex justify-content-center gap-3 mb-3">
                  <div className="text-center">
                    <div className="fs-4 fw-bold">{userData.cases?.length || 0}</div>
                    <div className="text-muted small">Cases</div>
                  </div>
                  <div className="text-center">
                    <div className="fs-4 fw-bold">{userData.appointments?.length || 0}</div>
                    <div className="text-muted small">Meetings</div>
                  </div>
                </div>

                <hr className="my-3" />

                <div className="text-start">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-briefcase me-2 text-muted"></i>
                    <span>{userData.occupation || "Not specified"}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-phone me-2 text-muted"></i>
                    <span>{userData.phone || "Not provided"}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-map-marker-alt me-2 text-muted"></i>
                    <span>
                      {[userData.city, userData.state].filter(Boolean).join(", ") || "Location not specified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom py-3">
                <ul className="nav nav-tabs card-header-tabs">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
                      onClick={() => setActiveTab("profile")}
                    >
                      <i className="fas fa-user-circle me-2"></i>Profile
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "cases" ? "active" : ""}`}
                      onClick={() => setActiveTab("cases")}
                    >
                      <i className="fas fa-gavel me-2"></i>Cases
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "appointments" ? "active" : ""}`}
                      onClick={() => setActiveTab("appointments")}
                    >
                      <i className="fas fa-calendar-alt me-2"></i>Appointments
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body p-0">
                {activeTab === "profile" && (
                  <div className="p-4">
                    <h5 className="mb-4 text-primary">
                      <i className="fas fa-info-circle me-2"></i>Client Details
                    </h5>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="profile-info-card">
                          <h6 className="info-label">Full Address</h6>
                          <p className="info-value">
                            <i className="fas fa-home me-2"></i>
                            {userData.address || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="profile-info-card">
                          <h6 className="info-label">Legal Jurisdiction</h6>
                          <p className="info-value">
                            <i className="fas fa-balance-scale me-2"></i>
                            {userData.state || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {userData.legalNeeds?.length > 0 && (
                      <div className="mt-4">
                        <h5 className="mb-3 text-primary">
                          <i className="fas fa-scale-balanced me-2"></i>Legal Interests
                        </h5>
                        <div className="d-flex flex-wrap gap-2">
                          {userData.legalNeeds.map((need, index) => (
                            <span key={index} className="badge bg-primary bg-opacity-10 text-primary">
                              {need}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <h5 className="mb-3 text-primary">
                        <i className="fas fa-file-contract me-2"></i>Recent Activity
                      </h5>
                      <div className="list-group">
                        {userData.cases?.slice(0, 3).map((caseItem, index) => (
                          <div key={index} className="list-group-item border-0 px-0 py-2">
                            <div className="d-flex justify-content-between">
                              <span className="fw-medium">{caseItem.title || `Case ${index + 1}`}</span>
                              <span className="text-muted small">{caseItem.status || "In Progress"}</span>
                            </div>
                            <div className="small text-muted">
                              Last updated: {formatDate(caseItem.updatedAt) || "N/A"}
                            </div>
                          </div>
                        ))}
                        {userData.cases?.length === 0 && (
                          <div className="text-muted">No recent case activity</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "cases" && (
                  <div className="p-4">
                    <h5 className="mb-4 text-primary">
                      <i className="fas fa-gavel me-2"></i>Case History
                    </h5>
                    
                    {userData.cases?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Case #</th>
                              <th>Title</th>
                              <th>Type</th>
                              <th>Status</th>
                              <th>Last Updated</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userData.cases.map((caseItem, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{caseItem.title || `Case ${index + 1}`}</td>
                                <td>
                                  <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                    {caseItem.type || "General"}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    caseItem.status === "Closed" 
                                      ? "bg-success bg-opacity-10 text-success" 
                                      : "bg-warning bg-opacity-10 text-warning"
                                  }`}>
                                    {caseItem.status || "Open"}
                                  </span>
                                </td>
                                <td>{formatDate(caseItem.updatedAt) || "N/A"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
                        <h5>No Cases Found</h5>
                        <p className="text-muted">This client doesn't have any cases yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "appointments" && (
                  <div className="p-4">
                    <h5 className="mb-4 text-primary">
                      <i className="fas fa-calendar-alt me-2"></i>Scheduled Meetings
                    </h5>
                    
                    {userData.appointments?.length > 0 ? (
                      <div className="list-group">
                        {userData.appointments.map((appt, index) => (
                          <div key={index} className="list-group-item border-0 px-0 py-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="mb-0 fw-medium">{appt.title || "Legal Consultation"}</h6>
                              <span className={`badge ${
                                new Date(appt.date) < new Date() 
                                  ? "bg-secondary bg-opacity-10 text-secondary" 
                                  : "bg-primary bg-opacity-10 text-primary"
                              }`}>
                                {new Date(appt.date) < new Date() ? "Completed" : "Upcoming"}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <div>
                                <i className="far fa-calendar me-2 text-muted"></i>
                                {formatDate(appt.date)}
                              </div>
                              <div>
                                <i className="far fa-clock me-2 text-muted"></i>
                                {appt.time || "10:00 AM"}
                              </div>
                              <div>
                                <i className="fas fa-info-circle me-2 text-muted"></i>
                                {appt.type || "In-Person"}
                              </div>
                            </div>
                            {appt.notes && (
                              <div className="mt-2 small text-muted">
                                <i className="far fa-sticky-note me-2"></i>
                                {appt.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                        <h5>No Appointments Scheduled</h5>
                        <p className="text-muted">This client doesn't have any upcoming meetings.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .avatar-container {
          width: 100px;
          height: 100px;
          position: relative;
        }
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          border: 3px solid #e0e0e0;
        }
        .profile-info-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          height: 100%;
          border-left: 4px solid #1E4D7A;
        }
        .info-label {
          color: #495057;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .info-value {
          color: #212529;
          font-size: 1rem;
          margin-bottom: 0;
          display: flex;
          align-items: center;
        }
        .nav-tabs .nav-link {
          color: #495057;
          border: none;
          padding: 0.75rem 1.25rem;
          font-weight: 500;
        }
        .nav-tabs .nav-link.active {
          color: #1E4D7A;
          border-bottom: 3px solid #1E4D7A;
          background: transparent;
        }
        .nav-tabs .nav-link:hover:not(.active) {
          color: #1E4D7A;
        }
        .table th {
          border-top: none;
          font-weight: 600;
          color: #495057;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
        }
        .list-group-item {
          border-left: none;
          border-right: none;
        }
        .list-group-item:first-child {
          border-top: none;
        }
      `}</style>
    </>
  );
};

export default UserDashboard;