import React, { useState } from "react";
import axios from "axios";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("", {
        oldPassword,
        newPassword,
      });
      setSuccess("Password changed successfully!");
      setError("");
      console.log("Password changed:", response);
    } catch (error) {
      setError("An error occurred while changing the password.");
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-green-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Change Your Password</h2>
          <p className="text-lg mb-8">
            Your password must have at least 6 characters, include text, number, except special characters.
          </p>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600" htmlFor="oldPassword">
              Old Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="oldPassword"
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <button className="absolute right-3 top-3 text-gray-600">👁️</button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600" htmlFor="newPassword">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="newPassword"
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button className="absolute right-3 top-3 text-gray-600">👁️</button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600" htmlFor="confirmPassword">
              New Password Again
            </label>
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button className="absolute right-3 top-3 text-gray-600">👁️</button>
            </div>
          </div>

          <div className="mb-6">
            <a href="#" className="text-sm text-blue-500">Forgot Password</a>
          </div>

          <button type="submit" className="w-full bg-green-500 text-white p-3 rounded-md font-semibold">
            Save Change
          </button>

          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-blue-500">Back to Home Page</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
