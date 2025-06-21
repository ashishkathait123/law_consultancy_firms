import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AuthAnimation.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
const AuthPage = () => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegisterVisible, setIsRegisterVisible] = useState(true);
  const [animationDirection, setAnimationDirection] = useState('left');
const navigate = useNavigate();
  // Registration state
  const [userRole, setUserRole] = useState('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
   

  const [formData, setFormData] = useState({
    role: 'user',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    addressline: '',
    city: '',
    purpose: '',
    licenseNumber: '',
    experience: '',
    specialization: ''
  });

  // Login state
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
const API_URL1 = 'https://lawyerbackend-qrqa.onrender.com/lawapi/auth';
  const API_URL = 'https://lawyerbackend-qrqa.onrender.com/lawapi/auth/register';

  // Toggle between login and registration with animation
  const toggleAuthForms = (direction) => {
    setAnimationDirection(direction);
    
    if (direction === 'left') {
      // Show login, hide register
      setIsLoginVisible(true);
      setTimeout(() => setIsRegisterVisible(false), 300);
    } else {
      // Show register, hide login
      setIsRegisterVisible(true);
      setTimeout(() => setIsLoginVisible(false), 300);
    }
  };

  // Registration handlers
  const handleRoleChange = (e) => {
    const role = e.target.value;
    setUserRole(role);
    setFormData({
      ...formData,
      role: role,
      licenseNumber: role === 'lawyer' ? formData.licenseNumber : '',
      experience: role === 'lawyer' ? formData.experience : '',
      specialization: role === 'lawyer' ? formData.specialization : '',
      purpose: role === 'user' ? formData.purpose : '',
      addressline: role !== 'admin' ? formData.addressline : '',
      city: role !== 'admin' ? formData.city : ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateRegistrationForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return false;
    }

    if (userRole === 'lawyer') {
      if (!formData.licenseNumber || !formData.experience || !formData.specialization) {
        toast.error('Please fill all required fields for lawyer registration');
        return false;
      }
    }

    if (userRole === 'user' && !formData.purpose) {
      toast.error('Please specify your purpose');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateRegistrationForm()) return;

    setIsSubmitting(true);

    try {
      let submissionData;
      
      if (userRole === 'admin') {
        submissionData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone
        };
      } else if (userRole === 'lawyer') {
        submissionData = {
          role: formData.role,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          addressline: formData.addressline,
          city: formData.city,
          licenseNumber: formData.licenseNumber,
          phone: formData.phone,
          experience: formData.experience,
          specialization: formData.specialization
        };
      } else { // user
        submissionData = {
          role: formData.role,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          addressline: formData.addressline,
          city: formData.city,
          purpose: formData.purpose
        };
      }

      const response = await axios.post(API_URL, submissionData);
      
      if (response.data.success) {
        toast.success('Registration successful!');
        // Reset form and show login
        setFormData({
          role: 'user',
          name: '',
          email: '',
          phone: '',
          password: '',
     
          addressline: '',
          city: '',
          purpose: '',
          licenseNumber: '',
          experience: '',
          specialization: ''
        });
        setUserRole('user');
        toggleAuthForms('left');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login handlers
  const handleLoginChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    console.log("Sending login request with:", credentials);
    const response = await axios.post(`${API_URL1}/login`, credentials);
    console.log("Login response:", response.data);

    // Check for successful login message instead of success flag
    if (response.data.message && response.data.message.includes('successful')) {
      // Store authentication data
      sessionStorage.setItem('token', response.data.accessToken); // Note: using accessToken
      sessionStorage.setItem('role', response.data.user?.role || credentials.role);
      sessionStorage.setItem('userData', JSON.stringify(response.data.user));

      console.log("Session storage after login:", {
        token: sessionStorage.getItem('token'),
        role: sessionStorage.getItem('role'),
        userData: sessionStorage.getItem('userData')
      });

      toast.success('Login successful!');

      // Get role - prioritize API response over form selection
      const userRole = response.data.user?.role || credentials.role;
      console.log("Determined user role:", userRole);

      // Navigate based on role
      const targetPath = {
        admin: '/admin/dashboard',
        lawyer: '/lawyer/dashboard',
        user: '/user/dashboard'
      }[userRole.toLowerCase()] || '/';

      console.log("Attempting navigation to:", targetPath);
      navigate(targetPath);
    } else {
      console.error("Login failed:", response.data.message);
      setError(response.data.message || 'Login failed.');
    }
  } catch (err) {
    console.error("Login error:", err);
    setError(err.response?.data?.message || 'Something went wrong.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
      minHeight: '100vh',
      padding: '2rem 0',
      overflow: 'hidden'
    }}>
      <ToastContainer position="top-center" autoClose={5000} />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Registration Form */}
            <div 
              className={`auth-form-container ${isRegisterVisible ? 'active' : ''} ${animationDirection === 'right' ? 'slide-out-right' : 'slide-in-right'}`}
              style={{ display: isRegisterVisible ? 'block' : 'none' }}
            >
              <div className="card shadow-lg border-0" style={{
                borderRadius: '15px',
                overflow: 'hidden',
                border: 'none'
              }}>
                <div className="card-header py-4" style={{
                  background: 'linear-gradient(to right, #283e51, #485563)',
                  color: 'white'
                }}>
                  <h2 className="text-center mb-0" style={{ fontWeight: '700' }}>
                    <i className="fas fa-user-plus me-2"></i>
                    Create Your Account
                  </h2>
                  <p className="text-center mb-0 mt-2">Join us today and get started</p>
                </div>
                <div className="card-body p-5" style={{ backgroundColor: '#f8f9fa' }}>
                  <form onSubmit={handleRegister}>
                    {/* Role Selection */}
                   <div className="form-group mb-4">
  <label className="d-block mb-3 fw-bold">I am registering as:</label>
  <div className="d-flex flex-wrap gap-2">
    <button
      type="button"
      className={`btn ${userRole === 'user' ? 'btn-outline-dark' : 'btn-outline-dark'} rounded-pill px-4`}
      onClick={() => handleRoleChange({ target: { value: 'user' } })}
    >
      <i className="fas fa-user me-2"></i> Customer
    </button>
    <button
      type="button"
      className={`btn ${userRole === 'admin' ? 'btn-outline-dark' : 'btn-outline-dark'} rounded-pill px-4`}
      onClick={() => handleRoleChange({ target: { value: 'admin' } })}
    >
      <i className="fas fa-user-shield me-2"></i> Super Admin
    </button>
    <button
      type="button"
      className={`btn ${userRole === 'lawyer' ? 'btn-outline-dark' : 'btn-outline-dark'} rounded-pill px-4`}
      onClick={() => handleRoleChange({ target: { value: 'lawyer' } })}
    >
      <i className="fas fa-gavel me-2"></i> Lawyer
    </button>
  </div>
</div>


                    <div className="row">
                      {/* Common Fields */}
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="fw-bold">Email Address <span className="text-danger">*</span></label>
                          <div className="input-group">
                            <span className="input-group-text bg-white">
                              <i className="fas fa-envelope text-primary"></i>
                            </span>
                            <input
                              type="email"
                              className="form-control"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              placeholder="example@domain.com"
                            />
                          </div>
                        </div>
                      </div>

                     <div className="col-md-6">
  <div className="form-group mb-3">
    <label className="fw-bold">
      Full Name{" "}
      {userRole !== "admin" && <span className="text-danger">*</span>}
    </label>
    <div className="input-group">
      <span className="input-group-text bg-white">
        <i className="fas fa-user text-primary"></i>
      </span>
      <input
        type="text"
        className="form-control"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        required={userRole !== "admin"}
        // readOnly={userRole === "admin"} // ✅ instead of disabled
        placeholder="John Doe"
      />
    </div>
    {/* Include hidden input to ensure admin name is submitted */}
    {userRole === "admin" && (
      <input type="hidden" name="name" value={formData.name} />
    )}
  </div>
</div>

                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="fw-bold">Phone Number <span className="text-danger">*</span></label>
                          <div className="input-group">
                            <span className="input-group-text bg-white">
                              <i className="fas fa-phone text-primary"></i>
                            </span>
                            <input
                              type="tel"
                              className="form-control"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              placeholder="+1 234 567 890"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="fw-bold">Password <span className="text-danger">*</span></label>
                          <div className="input-group">
                            <span className="input-group-text bg-white">
                              <i className="fas fa-lock text-primary"></i>
                            </span>
                            <input
                              type={showRegisterPassword ? "text" : "password"}
                              className="form-control"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              required
                              minLength="6"
                              placeholder="••••••"
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            >
                              {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                          <small className="text-muted">Minimum 6 characters</small>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="fw-bold">Confirm Password <span className="text-danger">*</span></label>
                          <div className="input-group">
                            <span className="input-group-text bg-white">
                              <i className="fas fa-lock text-primary"></i>
                            </span>
                            <input
                              type={showRegisterConfirmPassword ? "text" : "password"}
                              className="form-control"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              required
                              placeholder="••••••"
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                            >
                              {showRegisterConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* City field for non-admin users */}
                      {(userRole === 'user' || userRole === 'lawyer') && (
                        <div className="col-md-6">
                          <div className="form-group mb-3">
                            <label className="fw-bold">City <span className="text-danger">*</span></label>
                            <div className="input-group">
                              <span className="input-group-text bg-white">
                                <i className="fas fa-city text-primary"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required={userRole === 'lawyer'}
                                placeholder="New York"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Address field for non-admin users */}
                    {(userRole === 'user' || userRole === 'lawyer') && (
                      <div className="form-group mb-3">
                        <label className="fw-bold">Address</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white">
                            <i className="fas fa-map-marker-alt text-primary"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            name="addressline"
                            value={formData.addressline}
                            onChange={handleInputChange}
                            required={userRole === 'lawyer'}
                            placeholder="123 Main St"
                          />
                        </div>
                      </div>
                    )}

                    {/* Customer-specific Field */}
                    {userRole === 'user' && (
                      <div className="form-group mb-3">
                        <label className="fw-bold">Purpose of Registration <span className="text-danger">*</span></label>
                        <div className="input-group">
                          <span className="input-group-text bg-white">
                            <i className="fas fa-comment-dots text-primary"></i>
                          </span>
                          <textarea
                            className="form-control"
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleInputChange}
                            rows="2"
                            required
                            placeholder="Briefly describe your purpose..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Lawyer-specific Fields */}
                    {userRole === 'lawyer' && (
                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-group mb-3">
                            <label className="fw-bold">License Number <span className="text-danger">*</span></label>
                            <div className="input-group">
                              <span className="input-group-text bg-white">
                                <i className="fas fa-id-card text-primary"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleInputChange}
                                required
                                placeholder="LAW-123456"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="form-group mb-3">
                            <label className="fw-bold">Experience <span className="text-danger">*</span></label>
                            <div className="input-group">
                              <span className="input-group-text bg-white">
                                <i className="fas fa-briefcase text-primary"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                name="experience"
                                value={formData.experience}
                                onChange={handleInputChange}
                                required
                                placeholder="5 years"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="form-group mb-3">
                            <label className="fw-bold">Specialization <span className="text-danger">*</span></label>
                            <div className="input-group">
                              <span className="input-group-text bg-white">
                                <i className="fas fa-star text-primary"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleInputChange}
                                required
                                placeholder="Criminal Law"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="form-group mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 py-3 fw-bold"
                        disabled={isSubmitting}
                        style={{
                          background: 'linear-gradient(to right, #283e51, #485563)',
                          border: 'none',
                          borderRadius: '50px'
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Registering...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-user-plus me-2"></i> Complete Registration
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center mt-3">
                      <p className="mb-0">
                        Already have an account?{' '}
                        <button 
                          type="button" 
                          className="text-primary fw-bold ms-1 btn btn-link p-0 border-0"
                          onClick={() => toggleAuthForms('left')}
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <div 
  className={`auth-form-container ${isLoginVisible ? 'active' : ''} ${animationDirection === 'left' ? 'slide-out-left' : 'slide-in-left'}`}
  style={{ display: isLoginVisible ? 'block' : 'none' }}
>
  <div className="card shadow-lg border-0" style={{
    borderRadius: '15px',
    overflow: 'hidden',
    border: 'none'
  }}>
    <div className="card-header py-4" style={{
      background: 'linear-gradient(to right, #ff758c 0%, #ff7eb3 100%)',
      color: 'white'
    }}>
      <h2 className="text-center mb-0" style={{ fontWeight: '700' }}>
        <i className="fas fa-sign-in-alt me-2"></i>
        Welcome Back
      </h2>
      <p className="text-center mb-0 mt-2">Sign in to continue</p>
    </div>
    <div className="card-body p-5" style={{ backgroundColor: '#f8f9fa' }}>
      <form onSubmit={handleLogin}>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="form-group mb-3">
          <label className="fw-bold">Role <span className="text-danger">*</span></label>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="fas fa-user-tag text-primary"></i>
            </span>
            <select
              className="form-control"
              name="role"
              value={credentials.role || ''}
              onChange={handleLoginChange}
              required
            >
              <option value="">Select your role</option>
              <option value="user">Customer</option>
              <option value="admin">Admin</option>
              <option value="lawyer">Lawyer</option>
            </select>
          </div>
        </div>

        <div className="form-group mb-3">
          <label className="fw-bold">Email Address <span className="text-danger">*</span></label>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="fas fa-envelope text-primary"></i>
            </span>
            <input
              type="email"
              className="form-control"
              name="email"
              value={credentials.email}
              onChange={handleLoginChange}
              required
              placeholder="example@domain.com"
            />
          </div>
        </div>

        <div className="form-group mb-3">
          <label className="fw-bold">Password <span className="text-danger">*</span></label>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="fas fa-lock text-primary"></i>
            </span>
            <input
              type={showLoginPassword ? "text" : "password"}
              className="form-control"
              name="password"
              value={credentials.password}
              onChange={handleLoginChange}
              required
              placeholder="••••••"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
            >
              {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="form-group mt-4">
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 py-3 fw-bold"
            disabled={loading}
            style={{
              background: 'linear-gradient(to right, #ff758c 0%, #ff7eb3 100%)',
              border: 'none',
              borderRadius: '50px'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt me-2"></i> Login
              </>
            )}
          </button>
        </div>

        <div className="text-center mt-3">
          <p className="mb-0">
            Don't have an account?{' '}
            <button 
              type="button" 
              className="text-primary fw-bold ms-1 btn btn-link p-0 border-0"
              onClick={() => toggleAuthForms('right')}
            >
              Register
            </button>
          </p>
        </div>
      </form>
    </div>
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;