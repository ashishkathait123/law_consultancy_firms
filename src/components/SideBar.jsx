import React, { useState } from "react";
import "./sidebar.css";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaBook,
  FaFileContract,
  FaUserTie,
  FaGavel,
  FaHome,
  FaHistory,
  FaChartBar,
  FaCog,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClipboardList
} from "react-icons/fa";
import { IoGridOutline } from "react-icons/io5";
import { MdOutlineProductionQuantityLimits, MdOutlineCategory } from "react-icons/md";
import { RiBriefcase4Fill, RiFileList3Fill } from "react-icons/ri";
import { PiChalkboardTeacherFill, PiStudentBold } from "react-icons/pi";

const SideBar = () => {
  const [dropdowns, setDropdowns] = useState({
    cases: false,
    clients: false,
    documents: false,
    billing: false
  });

  const toggleDropdown = (name) => {
    setDropdowns({ ...dropdowns, [name]: !dropdowns[name] });
  };

  const role = sessionStorage.getItem("role");

  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        {/* Common Items for All Roles */}
        {/* <li className="nav-item">
          <Link className="nav-link" to="/dashboard">
            <IoGridOutline size={20} />
            <span>Dashboard</span>
          </Link>
        </li> */}

        {/* Admin Specific Items */}
        {role === "admin" && (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/Admin/customner">
                <FaUsers size={20} />
                <span>User Management</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/Admin/lawyerManagement">
                <FaUsers size={20} />
                <span>Lawyer Management</span>
              </Link>
            </li>

            <li className="nav-item">
              <a 
                className={`nav-link ${dropdowns.cases ? '' : 'collapsed'}`} 
                onClick={() => toggleDropdown('cases')}
              >
                <RiBriefcase4Fill size={20} />
                <span>Case Management</span>
                <i className={`bi bi-chevron-${dropdowns.cases ? 'up' : 'down'}`}></i>
              </a>
              <ul className={`nav-content ${dropdowns.cases ? 'show' : ''}`}>
                <li>
                  <Link to="/cases/all">
                    <i className="bi bi-circle"></i>
                    <span>All Cases</span>
                  </Link>
                </li>
                <li>
                  <Link to="/cases/active">
                    <i className="bi bi-circle"></i>
                    <span>Active Cases</span>
                  </Link>
                </li>
                <li>
                  <Link to="/cases/closed">
                    <i className="bi bi-circle"></i>
                    <span>Closed Cases</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/reports">
                <FaChartBar size={20} />
                <span>Reports</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/settings">
                <FaCog size={20} />
                <span>System Settings</span>
              </Link>
            </li>
          </>
        )}

        {/* Lawyer Specific Items */}
        {role === "lawyer" && (
          <>
            <li className="nav-item">
              <a 
                className={`nav-link ${dropdowns.clients ? '' : 'collapsed'}`} 
                onClick={() => toggleDropdown('clients')}
              >
                <FaUserTie size={20} />
                <span>Clients</span>
                <i className={`bi bi-chevron-${dropdowns.clients ? 'up' : 'down'}`}></i>
              </a>
              <ul className={`nav-content ${dropdowns.clients ? 'show' : ''}`}>
                <li>
                  <Link to="/clients/all">
                    <i className="bi bi-circle"></i>
                    <span>All Clients</span>
                  </Link>
                </li>
                <li>
                  <Link to="/clients/add">
                    <i className="bi bi-circle"></i>
                    <span>Add New Client</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/my-cases">
                <FaGavel size={20} />
                <span>My Cases</span>
              </Link>
            </li>

            <li className="nav-item">
              <a 
                className={`nav-link ${dropdowns.documents ? '' : 'collapsed'}`} 
                onClick={() => toggleDropdown('documents')}
              >
                <RiFileList3Fill size={20} />
                <span>Documents</span>
                <i className={`bi bi-chevron-${dropdowns.documents ? 'up' : 'down'}`}></i>
              </a>
              <ul className={`nav-content ${dropdowns.documents ? 'show' : ''}`}>
                <li>
                  <Link to="/documents/templates">
                    <i className="bi bi-circle"></i>
                    <span>Templates</span>
                  </Link>
                </li>
                <li>
                  <Link to="/documents/upload">
                    <i className="bi bi-circle"></i>
                    <span>Upload Documents</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/calendar">
                <FaCalendarAlt size={20} />
                <span>Calendar</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/billing">
                <FaMoneyBillWave size={20} />
                <span>Billing</span>
              </Link>
            </li>

             <li className="nav-item">
              <Link className="nav-link" to="/Mybooking">
                <FaMoneyBillWave size={20} />
                <span>Booking</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/lawyer/Lawyer_Profile.jsx">
                <FaMoneyBillWave size={20} />
                <span>Profile</span>
              </Link>
            </li>


          </>
        )}

        {/* User (Customer) Specific Items */}
        {role === "user" && (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/my-requests">
                <FaClipboardList size={20} />
                <span>My Requests</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/my-lawyers">
                <FaUserTie size={20} />
                <span>My Lawyers</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/my-documents">
                <FaFileContract size={20} />
                <span>My Documents</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/user/CaseHistory">
                <FaHistory size={20} />
                <span>Case History</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/user/FindLawyer">
                <FaGavel size={20} />
                <span>Find a Lawyer</span>
              </Link>
            
            </li>
            <li className="nav-item">
          <Link className="nav-link" to="/user/profile">
            <i className="bi bi-person"></i>
            <span>Profile</span>
          </Link>
        </li>
          </>
        )}

        {/* Common Bottom Items */}
        
        <li className="nav-item">
          <Link className="nav-link" to="/help">
            <i className="bi bi-question-circle"></i>
            <span>Help</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/logout">
<i className="fas fa-sign-out-alt"></i>
            <span>Log Out</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default SideBar;