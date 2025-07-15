import React from "react";
import { useNavigate } from "react-router-dom";

const WebNav = () => {
  const handleNav = (route) => {
    const BASE_URL = "https://law101-git-low3-ashish8.vercel.app";
    window.location.href = `${BASE_URL}${route}`;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light shadow-sm py-3" style={{ background: "linear-gradient(to bottom, #fff, #f4f4f4)" }}>
      <div className="container-fluid px-4 px-md-5 mb-5">
        <span
          className="navbar-brand fw-bold text-primary"
          style={{ fontSize: "1.5rem", cursor: "pointer", fontFamily: "cursive" }}
          onClick={() => handleNav("/")}
        >
          Legal <span className="text-primary" style={{ fontWeight: 800 }}>Up</span>
        </span>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav gap-3">
            <li className="nav-item">
              <button className="nav-link btn btn-link text-dark" onClick={() => handleNav("/")}>Home</button>
            </li>
            <li className="nav-item">
              <button className="nav-link btn btn-link text-dark" onClick={() => handleNav("/about")}>About Us</button>
            </li>
            <li className="nav-item">
              <button className="nav-link btn btn-link text-dark" onClick={() => handleNav("/chat")}>Chat With Lawyer</button>
            </li>
            <li className="nav-item">
              <button className="nav-link btn btn-link text-dark" onClick={() => handleNav("/document")}>Documentary Lawyers</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};


export default WebNav;
