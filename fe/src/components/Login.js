import React, { useState } from "react";
import axios from "axios";

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
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="w-full max-w-md bg-white p-8 rounded-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Login</h2>
          <p className="text-lg mb-8">Login to access your travelwise account</p>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600" htmlFor="email">
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
            <label className="block text-sm font-medium text-gray-600" htmlFor="password">
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
              <label htmlFor="rememberMe" className="text-sm">Remember me</label>
            </div>
            <a href="#" className="text-sm text-blue-500">Forgot Password</a>
          </div>

          <button type="submit" className="w-full bg-green-500 text-white p-3 rounded-md font-semibold">
            Login
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm">
              Don’t have an account? <a href="#" className="text-blue-500">Sign up</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
