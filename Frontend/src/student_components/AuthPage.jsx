import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthPage = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("login");
  const [registerStep, setRegisterStep] = useState(1); // 1: info, 2: otp, 3: password
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    referralCode: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const otpInputRefs = useRef([]);

  const switchView = (view) => {
    setCurrentView(view);
    setRegisterStep(1);
    setFormData({ name: "", email: "", phone: "", referralCode: "", password: "" });
    setErrors({});
    setMessage({ type: "", text: "" });
    setShowPassword(false);
    setOtp("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (currentView === "signup" && registerStep === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
      if (!formData.phone.trim()) newErrors.phone = "Phone is required";
      else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone must be 10 digits";
    }
    if (currentView === "signup" && registerStep === 3) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    }
    if (currentView === "login") {
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
      if (!formData.password) newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setOtp(value.slice(0, 6));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (currentView === "login") {
        // Login as before
        const response = await fetch(`${apiUrl}/api/auth/student-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const data = await response.json();
        if (response.ok) {
          if (data.token) localStorage.setItem("token", data.token);
          if (data.student && data.student.id) localStorage.setItem("studentId", data.student.id);
          setMessage({ type: "success", text: "Login successful! Redirecting..." });
          setTimeout(() => navigate("/dashboard"), 1000);
          if (onAuthSuccess) onAuthSuccess(data);
        } else {
          setMessage({ type: "error", text: data.message || "Something went wrong" });
        }
      } else if (currentView === "signup" && registerStep === 1) {
        // Step 1: initiate registration, send OTP
        const response = await fetch(`${apiUrl}/api/student/register/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            referralCode: formData.referralCode
          })
        });
        const data = await response.json();
        if (response.ok) {
          setRegisterStep(2);
          setMessage({ type: "success", text: "OTP sent to your email/phone." });
        } else {
          console.log(data);
          setMessage({ type: "error", text: data?.message || data?.error || "Failed to send OTP." });
        }
      } else if (currentView === "signup" && registerStep === 2) {
        // Step 2: verify OTP
        const response = await fetch(`${apiUrl}/api/auth/register/check-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp,
            type:'student',
          })
        });
        const data = await response.json(); console.log(data);
        if (response.ok && data.valid) {
          setRegisterStep(3);
          setMessage({ type: "success", text: "OTP verified! Set your password." });
        } else {
          setMessage({ type: "error", text: data.message || "OTP Invalid or expired " });
        }
      } else if (currentView === "signup" && registerStep === 3) {
        // Step 3: set password and complete registration
        const response = await fetch(`${apiUrl}/api/student/register/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            referralCode: formData.referralCode,
            password: formData.password
          })
        });
        const data = await response.json();
        if (response.ok) {
          setMessage({ type: "success", text: "Account created! Redirecting..." });
          setTimeout(() => navigate("/dashboard"), 1000);
          if (onAuthSuccess) onAuthSuccess(data);
        } else {
          setMessage({ type: "error", text: data?.message || data?.error ||"Failed to create account." });
        }
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-yellow-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/login_panel')}
        className="absolute top-6 left-6 inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 bg-white/80 hover:bg-white/90 rounded-lg shadow-sm transition-all duration-300 backdrop-blur-sm"
      >
        <FaArrowLeft className="mr-2 h-4 w-4" />
        Login Panel
      </button>

      <div className="max-w-md w-full space-y-8 bg-white/90 rounded-2xl shadow-lg px-8 py-10">
        <div className="text-center">
          <img
            alt="Logo"
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            className="mx-auto w-16 h-16 mb-2"
          />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            {currentView === "login"
              ? "Sign In to your Account"
              : registerStep === 1 ? "Create your Account" : registerStep === 2 ? "Verify OTP" : "Set Password"}
          </h2>
          <p className="text-gray-500 mt-2 text-base">
            {currentView === "login"
              ? "Welcome back! Please login to continue."
              : registerStep === 1 ? "Sign up to get started." : registerStep === 2 ? "Enter the OTP sent to your email/phone." : "Set your password to complete registration."}
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
          {currentView === "signup" && registerStep === 1 && (
            <>
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.name ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter your full name"
                  autoComplete="off"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.email ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter your email"
                  autoComplete="off"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="auth-phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  id="auth-phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter your phone number"
                  autoComplete="off"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="auth-referral" className="block text-sm font-medium text-gray-700">Referral Code (optional)</label>
                <input
                  id="auth-referral"
                  name="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter referral code"
                  autoComplete="off"
                />
              </div>
            </>
          )}
          {currentView === "signup" && registerStep === 2 && (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={handleOtpChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter the 6-digit OTP"
                autoComplete="off"
                maxLength={6}
              />
            </div>
          )}
          {currentView === "signup" && registerStep === 3 && (
            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.password ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Set your password"
                autoComplete="off"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
          )}
          {currentView === "login" && (
            <>
              <div>
                <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.email ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter your email"
                  autoComplete="off"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.password ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter your password"
                    autoComplete="off"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate('/student/forgot-password')}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
              </div>
              </div>
            </>
          )}
          {message.text && (
            <div className={`text-sm rounded-md px-3 py-2 ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{message.text}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md flex items-center justify-center"
          >
            {loading ? "Processing..." : currentView === "login" ? "Sign In" : registerStep === 1 ? "Send OTP" : registerStep === 2 ? "Verify OTP" : "Create Account"}
          </button>
        </form>
        <div className="text-center mt-4">
          {currentView === "login" ? (
            <>
              <span className="text-gray-600">Don't have an account? </span>
              <button className="text-blue-600 hover:underline" onClick={() => switchView("signup")}>Sign up</button>
            </>
          ) : (
            <>
              <span className="text-gray-600">Already have an account? </span>
              <button className="text-blue-600 hover:underline" onClick={() => switchView("login")}>Sign in</button>
            </>
          )}
        </div>
        <div className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} Campus Recruitment Portal
        </div>
      </div>
    </div>
  );
};

export default AuthPage;