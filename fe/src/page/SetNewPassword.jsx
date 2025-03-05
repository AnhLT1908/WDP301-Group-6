import React, { useState, useEffect } from "react";
import logo from "../../src/assets/images/logo2_text.png";
import forgotPasswordImg from "../../src/assets/images/forgot-password-image.png";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Info } from "lucide-react";

const SetNewPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showTooltip, setShowTooltip] = useState(false); // Tooltip visibility
  const location = useLocation();
  const { id } = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      console.log("Id:", id);
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Reset error

    // Check if both fields are filled
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // Check if the password is at least 8 characters long
    if (password.length < 8) {
      setError("The password must be at least 8 characters long.");
      return;
    }

    // Check if the password matches the confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Invalid password. Please hover over the info icon for more information on how to set a valid password."
      );
      return;
    }
    if (id) {
      axios
        .post("http://localhost:8080/api/v1/auth/reset-password", {
          id,
          password,
        })
        .then((res) => {
          localStorage.setItem(
            "toastMessage",
            "Password changed successfully!"
          );
          navigate("/login", { state: "" });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-white ml-[300px] mt-[350px]">
        <img
          src={logo}
          alt="Logo"
          className="absolute top-[40px] left-[60px] w-[120px] h-[90px]"
        />
        <h1 className="text-3xl font-bold mb-6">Set a password</h1>

        {/* Tooltip and info icon */}
        <div className="flex items-center mb-6">
          <p className="text-gray-600 mr-2">
            Your previous password has been reset. Please set a new password for
            your account.
          </p>
          <div className="relative">
            <Info
              className="text-gray-400 cursor-pointer"
              size={24}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {/* Tooltip */}
            {showTooltip && (
              <div
                id="tooltip-right"
                role="tooltip"
                className="absolute z-10 px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg opacity-100 transition-opacity duration-300 tooltip"
                style={{ width: "250px" }}
              >
                Mật khẩu phải có ít nhất:
                <br />
                - Một chữ cái viết hoa
                <br />
                - Một chữ cái viết thường
                <br />
                - Một chữ số
                <br />
                - Một ký tự đặc biệt
                <br />
                Và mật khẩu dài tối thiểu 8 ký tự
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
            )}
          </div>
        </div>

        {/* Password form */}
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password here"
            className="w-2/3 p-3 mb-4 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="w-2/3 p-3 mb-4 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="w-2/3 bg-green-500 text-white p-3 rounded-md"
          >
            Set password
          </button>
        </form>
      </div>

      <div className="w-1/2 bg-white-100 flex justify-center items-center mr-[200px]">
        <div className="bg-green-400 w-[600px] h-[800px] rounded-xl flex justify-center items-center">
          <div className="w-full">
            <img
              src={forgotPasswordImg}
              alt="Password Illustration"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetNewPassword;
