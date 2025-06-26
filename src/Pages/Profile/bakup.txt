import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify"; // ✅ Import toast
import "react-toastify/dist/ReactToastify.css";
import "./profile.css";

const UserProfile = () => {
  const token = sessionStorage.getItem("token");
  const [data, setData] = useState(null);

  const fetchUserData = async () => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await axios.get(
        "https://lawyerbackend-qrqa.onrender.com/lawapi/auth/profile",
        { headers }
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load profile.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (!data) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading profile...</div>
      </div>
    );
  }

  const handleStatusUpdate = async () => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      await axios.post(
        `https://lawyerbackend-qrqa.onrender.com/lawapi/common/updatelawyer/${data.lawyerId}`,
        { status: data.status },
        { headers }
      );
      toast.success("Status updated successfully!");
    } catch (error) {
      console.log("Token used:", token);
      console.error("Error updating status:", error?.response?.data || error.message);
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="profile-container">
      {/* Left Panel */}
      <motion.div
        className="profile-card left"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-header">
          <div className="profile-header-icon">
            <FaUser size={24} />
          </div>
          <div>
            <h3 className="profile-name">{data.name}</h3>
            <p className="profile-role">{data.role}</p>
          </div>
        </div>
        <div className="profile-details">
          <MiniRow icon="📧" label={data.email} />
          <MiniRow icon="📞" label={data.phone} />
          <MiniRow icon="🏙️" label={data.city} />
          <MiniRow icon="🎓" label={`Experience: ${data.experience} yrs`} />
          <MiniRow icon="💼" label={`Specialization: ${data.specialization}`} />
          <MiniRow icon="💰" label={`Fees: ₹${data.consultation_fees}`} />
          <MiniRow icon="📃" label={`License: ${data.licenseNumber}`} />
          <MiniRow icon="✅" label={`Verified: ${data.isverified ? "Yes" : "No"}`} />
        </div>
      </motion.div>

      {/* Right Panel */}
      <motion.div
        className="profile-card right"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="right-header">
          <h2>{data.name}</h2>
          <span>{data.role}</span>
          <div className="status-update-row">
            <div className="status-indicator">
              <span className={`status-dot ${data.status.toLowerCase()}`}></span>
              <strong>{data.status}</strong>
            </div>
            <select
              value={data.status}
              onChange={(e) => setData({ ...data, status: e.target.value })}
              className="status-dropdown"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="busy">Busy</option>
            </select>
            <button className="save-btn" onClick={handleStatusUpdate}>
              Save Status
            </button>
          </div>
        </div>

        <div className="section">
          <h4>Program Info</h4>
          <InfoRow label="Name" value={data.name} />
          <InfoRow label="Phone" value={data.phone} />
          <InfoRow label="Verified" value={data.isverified ? "Yes" : "No"} />
          <InfoRow label="Experience" value={`${data.experience} years`} />
          <InfoRow label="Specialization" value={data.specialization} />
          <InfoRow label="Consultation Fees" value={`₹${data.consultation_fees}`} />
          <InfoRow label="License Number" value={data.licenseNumber} />
        </div>

        <div className="section">
          <h4>Institution Info</h4>
          <InfoRow label="Lawyer ID" value={data.lawyerId} />
          <InfoRow label="Email" value={data.email} />
        </div>

        <div className="section">
          <h4>Location Info</h4>
          <InfoRow label="City" value={data.city} />
          <InfoRow label="Address" value={data.addressline || "N/A"} />
          <InfoRow label="Joined On" value={new Date(data.created_at).toDateString()} />
        </div>
      </motion.div>

      {/* ✅ Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

const MiniRow = ({ icon, label }) => (
  <div className="mini-row">
    <span>{icon}</span> <span>{label}</span>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="label">{label}</span>
    <span className="value">{value}</span>
  </div>
);

export default UserProfile;
