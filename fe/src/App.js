import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ForgotPassword from "./page/ForgotPassword.jsx";
import VerifyCodeForgotPassword from "./page/VerifyCodeForgotPassword.jsx";
import HomePage from "./page/HomePage.jsx";
import Login from "./page/Login.jsx";
import ChangePassword from "./page/ChangePassword.jsx";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<VerifyCodeForgotPassword />} />
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
