import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../../src/assets/images/logo2_text.png";
import loginImg from "../../src/assets/images/login.png";

const Login = ({ setAccountType }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
    
    const message = localStorage.getItem("toastMessage");
    if (message) {
      setToastMessage(message);
      setShowToast(true);
      localStorage.removeItem("toastMessage");
      setTimeout(() => setShowToast(false), 5000);
    }
  }, []);

  const validateForm = () => {
    let newErrors = {};
    if (!email) newErrors.email = "Email không được để trống.";
    if (!password) newErrors.password = "Mật khẩu không được để trống.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post("http://localhost:5000/api/v1/auth/login", { email, password });
      const { token, accountType } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("accountType", accountType);
      localStorage.setItem("user", JSON.stringify(response.data.data));

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      if (setAccountType) {
        setAccountType(accountType);
      }

      switch (accountType) {
        case "Admin":
          navigate("/admin");
          break;
        case "Manager":
          navigate("/manager/lodger-account-list");
          break;
        case "Lodger":
          navigate("/home");
          break;
        default:
          navigate("/404");
      }
    } catch (error) {
      if (error.response) {
        const message  = error.response.data.error;
        console.error(error.response.data.error);
        if (message === "Wrong email or Username") {
          setErrors({ email: "Email không tồn tại." });
        } else if (message === "Wrong password") {
          setErrors({ password: "Mật khẩu không đúng." });
        } else {
          setErrors({ general: "Đăng nhập thất bại, vui lòng thử lại." });
        }
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      {showToast && (
        <div className="fixed top-4 right-4 p-4 bg-white shadow rounded-lg">
          <p>{toastMessage}</p>
          <button onClick={() => setShowToast(false)}>✖</button>
        </div>
      )}
      <div className="w-1/2 bg-white ml-[110px]">
        <img src={logo} alt="Logo" className="absolute top-[20px] left-[40px] w-[120px] h-[90px]" />
        <h2 className="text-3xl font-bold mb-4">Login</h2>
        <p className="text-lg mb-8">Login to access your travelwise account</p>
        {errors.general && <p className="text-red-500 text-center mb-4">{errors.general}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input type="email" id="email" className="w-full p-3 border rounded-md" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium">Mật khẩu</label>
            <input type="password" id="password" className="w-full p-3 border rounded-md" value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center">
              <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
              <span className="ml-2 text-sm">Ghi nhớ đăng nhập</span>
            </label>
            <a href="/forgot-password" className="text-sm text-red-500">Quên mật khẩu?</a>
          </div>
          <button type="submit" className="w-full bg-green-500 text-white p-3 rounded-md font-semibold">Đăng nhập</button>
        </form>
      </div>
      <div className="w-1/2 flex justify-center items-center mr-[180px]">
        <div className="bg-green-400 w-[500px] h-[650px] ml-[140px] rounded-xl flex justify-center items-center">
          <img src={loginImg} alt="Password Illustration" className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
};

export default Login;
