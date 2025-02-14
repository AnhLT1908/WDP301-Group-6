import React, { useState } from "react";
import logo from "../../src/assets/images/logo2_text.png";
import forgotPasswordImg from "../../src/assets/images/forgot-password-image.png";
import Input from "../components/form/Input.jsx";
import Button from "../components/form/Button.jsx";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Email submitted: ${email}`);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-white ml-[300px] mt-[350px]">
        <img
          src={logo}
          alt="Logo"
          className="absolute top-[40px] left-[60px] w-[120px] h-[90px]"
        />
        <h1 className="text-3xl font-bold mb-6">Forgot your password?</h1>
        <p className="text-gray-600 mb-6">
          Don’t worry, happens to all of us. Enter your email below to recover
          your password.
        </p>

        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-2/3 p-3 mb-4 border border-gray-300 rounded-md"
          />
          <Button
            type="submit"
            className="w-2/3 bg-green-500 text-white p-3 rounded-md"
          >
            Submit
          </Button>
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

export default ForgotPassword;
