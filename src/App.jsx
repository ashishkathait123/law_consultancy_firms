import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Allmain from "./components/Allmain";
import ForgetPassword from "./Pages/ForgetPassword";
import AuthPage from "./Pages/AuthPage";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import Lawyerdashboard from "./Pages/lawyer/LawyerDashbaord";
import UserDashboard from "./Pages/user/UserDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/newpassword/:token" element={<ForgetPassword />} />
        
        {/* Explicitly define all protected routes */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/lawyer/dashboard" element={<Lawyerdashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        
        {/* Catch-all route */}
        <Route path="/*" element={<Allmain />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;