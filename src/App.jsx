// App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ForgetPassword from "./Pages/ForgetPassword";
import AuthPage from "./Pages/AuthPage";
import Allmain from "./components/Allmain";
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/newpassword/:token" element={<ForgetPassword />} />

        {/* All internal dashboard and protected pages */}
        <Route path="/*" element={<Allmain />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
