import React, { useState } from "react";
import logo from "../../src/assets/images/logo2_text.png";
import forgotPasswordImg from "../../src/assets/images/forgot-password-image.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State to handle loading
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Email submitted: ${email}`);

    if (!email) {
      setError("Please fill in this fields.");
      return;
    }

    // Disable the submit button while loading
    setLoading(true);
    setError(""); // Reset error message on submit

    axios
      .post(`http://localhost:8080/api/v1/auth/forgot-password`, { email })
      .then((res) => {
        console.log(res);
        console.log(res.data);
        const id = res.data.data.accountId;
        console.log(id);
        navigate("/verify-code", { state: { id } });
      })
      .catch((err) => {
        console.error("Front-end post forgot password error: ", err);
        if (err.response && err.response.data && err.response.data.message) {
          setError("Email does not exist. Please try again!");
        } else {
          // Handle general error
          setError("An error occurred. Please try again later.");
        }
      })
      .finally(() => {
        // Re-enable the submit button once the request is finished
        setLoading(false);
      });
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
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-2/3 p-3 mb-4 border border-gray-300 rounded-md"
            disabled={loading} // Disable input while loading
          />
          <button
            type="submit"
            className="w-2/3 bg-green-500 text-white p-3 rounded-md"
            disabled={loading} // Disable button while loading
          >
            {loading ? "Submitting..." : "Submit"}
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

export default ForgotPassword;
