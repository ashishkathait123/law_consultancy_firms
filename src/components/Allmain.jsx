import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./Header.jsx";
import SideBar from "./SideBar.jsx";
import LawyerManagement from "../Pages/Admin/LawyerManagement.jsx";
import "./main.css";
import AdminDashboard from "../Pages/Admin/AdminDashboard.jsx";
// import PageTitle from "./PageTitle.jsx";
// import Protected from "../Pages/Protected.jsx";
import Lawyerdashboard from "../Pages/lawyer/LawyerDashbaord.jsx";
 import UserDashboard from "../Pages/user/UserDashboard.jsx";
import CustomerManagement from "../Pages/Admin/CustomerManagement.jsx";

const Allmain = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    //       // Map routes to page titles
    const routeToTitle = {
      "/dashboard": "Dashboard",
      "/franchisedashboard": "Franchise dashboard",
      

    
      "/student-dashboard": "Student Dashboard",
    }
      

    const title = routeToTitle[location.pathname];
    if (title) {
      setPageTitle(title);
    } else {
      setPageTitle("");
    }
  }, [location.pathname]);
  return (
    <>
      <Header />
      <SideBar />
      <main
        id="main"
        className="main"
        style={{ background: "#99dee0", height: "auto" }}
      >
        {/* <PageTitle page={pageTitle} /> */}
      <Routes>
  <Route path="/Admin/admindashboard" element={<AdminDashboard />} />
  <Route path="/userdashboard" element={<UserDashboard />} />
  <Route path="/lawyer/dashboard" element={<Lawyerdashboard />} />
  <Route path="/Admin/lawyerManagement" element={<LawyerManagement />} />
  <Route path="/Admin/customner" element={<CustomerManagement/>} />
</Routes>
      </main>
    </>
  );
};

export default Allmain;
