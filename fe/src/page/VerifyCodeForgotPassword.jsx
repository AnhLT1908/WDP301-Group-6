import React, { useState } from "react";
import logo from "../../src/assets/images/logo2_text.png";
import forgotPasswordImg from "../../src/assets/images/forgot-password-image.png";
import axios from "axios";
import { useLocation } from "react-router-dom";

const VerifyCodeForgotPassword = () => {
  const [passwordResetCode, setPasswordResetCode] = useState("");
  const location = useLocation();
  const { id } = location.state || {};

  console.log("AccountId: ", id)

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Verify Code submitted: ${passwordResetCode}`);

    if (id) {
      axios
        .post(`http://localhost:8080/api/v1/auth/verify-password-reset-code`, {
          id,
          passwordResetCode,
        })
        .then((res) => {
          console.log(res);
          console.log(res.data);
        })
        .catch((err) => {
          console.error("Front end error verify password: ", err);
        });
    } else {
      console.error("Account ID not found.");
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
        <h1 className="text-3xl font-bold mb-6">Verify code</h1>
        <p className="text-gray-600 mb-6">
          An authentication code has been sent to your email.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={passwordResetCode}
            onChange={(e) => setPasswordResetCode(e.target.value)}
            placeholder="Enter code here"
            className="w-2/3 p-3 mb-4 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="w-2/3 bg-green-500 text-white p-3 rounded-md"
          >
            Verify
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

export default VerifyCodeForgotPassword;
