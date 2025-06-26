// components/Allmain.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./Header.jsx";
import SideBar from "./SideBar.jsx";
import AuthRoute from "./AuthRoute.jsx";
import Logout from "./LogOut.jsx";
import AdminDashboard from "../Pages/Admin/AdminDashboard.jsx";
import UserDashboard from "../Pages/user/UserDashboard.jsx";
import Lawyerdashboard from "../Pages/lawyer/LawyerDashbaord.jsx";
import LawyerManagement from "../Pages/Admin/LawyerManagement.jsx";
import CustomerManagement from "../Pages/Admin/CustomerManagement.jsx";
import ClientProfile from "../Pages/user/Profile.jsx";
import FindLawyer from "../Pages/user/FindLawyer.jsx";
import CaseHistory from "../Pages/user/CaseHistory.jsx";
import LawyerProfile from "../Pages/lawyer/Lawyer_Profile.jsx";
import "./main.css";
import Mybooking from "../Pages/lawyer/Mybooking.jsx";

const Allmain = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    const routeToTitle = {
      "/admin/dashboard": "Admin Dashboard",
      "/user/dashboard": "User Dashboard",
      "/lawyer/dashboard": "Lawyer Dashboard",
      "/admin/lawyerManagement": "Manage Lawyers",
      "/admin/customner": "Manage Customers",
      "/user/profile": "Manage profile",
      "/user/FindLawyer": "Find Lawyer",
      "/user/CaseHistory": "Case History",
    };

    const title = routeToTitle[location.pathname];
    setPageTitle(title || "");
  }, [location.pathname]);

  return (
    <>
      <Header />
      <SideBar />
      <main
        id="main"
        className="main"
style={{ background: "#f9f7f1", minHeight: "100vh" }}
      >
        {/* Optional: Page title */}
        {/* <PageTitle page={pageTitle} /> */}

        <Routes>
          
          <Route path="/admin/dashboard" element={<AuthRoute>  <AdminDashboard /> </AuthRoute>} />
          <Route path="/user/dashboard" element={<AuthRoute> <UserDashboard /> </AuthRoute>} />
          <Route path="/lawyer/dashboard" element={<AuthRoute> <Lawyerdashboard /> </AuthRoute>} />
          <Route path="/admin/lawyerManagement" element={<AuthRoute> <LawyerManagement /> </AuthRoute>} />
          <Route path="/admin/customner" element={<AuthRoute> <CustomerManagement /> </AuthRoute>} />
          <Route path="/user/profile" element={<AuthRoute> <ClientProfile /> </AuthRoute>} />
          <Route path="/lawyer/Lawyer_Profile.jsx" element={<AuthRoute> <LawyerProfile/> </AuthRoute>} />
          <Route path="/user/FindLawyer" element={<AuthRoute> <FindLawyer /> </AuthRoute>} />
          <Route path="/user/CaseHistory" element={<AuthRoute> <CaseHistory /> </AuthRoute>} />
           <Route path="/Mybooking" element={<AuthRoute> <Mybooking/> </AuthRoute>} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </main>
    </>
  );
};

export default Allmain;