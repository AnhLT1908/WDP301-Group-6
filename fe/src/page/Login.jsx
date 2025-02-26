import React, { useState } from "react";
import axios from "axios";
import logo from "../../src/assets/images/logo2_text.png";
import loginImg from "../../src/assets/images/login.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

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
