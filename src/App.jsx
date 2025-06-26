// App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ForgetPassword from "./Pages/ForgetPassword";
import AuthPage from "./Pages/AuthPage";
import Allmain from "./components/Allmain";
 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/newpassword/:token" element={<ForgetPassword />} />
 
        <Route path="/*" element={<Allmain />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
