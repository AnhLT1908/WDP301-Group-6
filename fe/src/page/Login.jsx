import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "../../src/assets/images/logo2_text.png";
import loginImg from "../../src/assets/images/login.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const message = localStorage.getItem("toastMessage");
    if (message) {
      setToastMessage(message);
      setShowToast(true);
      localStorage.removeItem("toastMessage"); // Remove the message after showing it
      setTimeout(() => setShowToast(false), 5000); // Hide toast after 3 seconds
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("", {
        email,
        password,
        rememberMe,
      });
      // Handle successful login (e.g., store token, redirect, etc.)
      console.log("Login successful", response);
    } catch (error) {
      setError("Invalid email or password.");
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      {/* Toast notification */}
      {showToast && (
        <div
          id="toast-success"
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800"
          role="alert"
        >
          <div className="ms-3 text-sm font-normal">{toastMessage}</div>
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Close"
            onClick={() => setShowToast(false)}
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
      )}
      {showToast && (
        <div className="fixed top-4 right-4 w-full max-w-xs progress-bar bg-green-400 rounded-lg"></div>
      )}

      {/* Login form */}
      <div className="w-1/2 bg-white ml-[110px] ">
        <img
          src={logo}
          alt="Logo"
          className="absolute top-[20px] left-[40px] w-[120px] h-[90px]"
        />
        <div>
          <h2 className="text-3xl font-bold mb-4">Login</h2>
          <p className="text-lg mb-8">
            Login to access your travelwise account
          </p>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-600"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-600"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="rememberMe" className="text-sm">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-red-500">
                Forgot Password
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white p-3 rounded-md font-semibold"
            >
              Login
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm">
                Don’t have an account?{" "}
                <a href="#" className="text-red-500">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="w-1/2 bg-white-100 flex justify-center items-center mr-[180px]">
        <div className="bg-green-400 w-[500px] h-[650px] ml-[140px] rounded-xl flex justify-center items-center">
          <div className="w-full">
            <img
              src={loginImg}
              alt="Password Illustration"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
