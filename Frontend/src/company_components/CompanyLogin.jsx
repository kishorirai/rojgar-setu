import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
axios.defaults.withCredentials = true;

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialRegisterData = {
  name: '', contactEmail: '', contactPhone: '', referralCode: '', password: ''
};

const CompanyLogin = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("login"); // "login" or "register"
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState(initialRegisterData);
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendTime, setResendTime] = useState(60);
  const [otpInputs, setOtpInputs] = useState(Array(6).fill(''));
  const [otpStatus, setOtpStatus] = useState('idle');
  const otpInputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (currentView === "register" && registerStep === 2) {
      setResendDisabled(true);
      setResendTime(60);
      setOtpStatus('idle');
      timer = setInterval(() => {
        setResendTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentView, registerStep]);

  const switchView = (view) => {
    setCurrentView(view);
    setFormData({ email: '', password: '' });
    setRegisterData(initialRegisterData);
    setErrors({});
    setMessage({ type: "", text: "" });
    setShowPassword(false);
    setRegisterStep(1);
    setOtpInputs(Array(6).fill(''));
    setOtpStatus('idle');
  };

  const validateForm = () => {
    const newErrors = {};
    if (currentView === "register") {
      if (!registerData.name.trim()) {
        newErrors.name = "Company name is required";
      }
      if (!registerData.contactEmail.trim()) {
        newErrors.contactEmail = "Contact email is required";
      } else if (!/\S+@\S+\.\S+/.test(registerData.contactEmail)) {
        newErrors.contactEmail = "Email is invalid";
      }
      if (!registerData.contactPhone.trim()) {
        newErrors.contactPhone = "Contact phone is required";
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (currentView === "register") {
      setRegisterData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleOtpInputChange = (e, index) => {
    const value = e.target.value;
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpInputs = [...otpInputs];
      newOtpInputs[index] = value;
      setOtpInputs(newOtpInputs);
      if (value && index < 5 && otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
      }

      if (newOtpInputs.every(input => input !== '')) {
        checkOtpVerificationStatus(newOtpInputs.join(''));
      }
    }
  };

  const checkOtpVerificationStatus = async (otp) => {
    setOtpStatus('verifying');
    setMessage({ type: "", text: "" });
    try {
      const res = await axios.post(`${apiUrl}/api/auth/register/check-otp`, {
        email: registerData.contactEmail,
        otp: otp,
        type: 'company'
      });
      if (res.data.valid) {
        setOtpStatus('verified');
      } else {
        setOtpStatus('error');
        setMessage({ type: "error", text: res.data.error || 'Invalid OTP.' });
        setOtpInputs(Array(6).fill(''));
        if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
      }
    } catch (err) {
      setOtpStatus('error');
      setMessage({ type: "error", text: err.response?.data?.error || 'Error verifying OTP.' });
      setOtpInputs(Array(6).fill(''));
      if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setResendTime(60);
    setMessage({ type: "", text: "" });
    try {
      const res = await axios.post(`${apiUrl}/api/company/register/initiate`, {
        name: registerData.name,
        contactEmail: registerData.contactEmail,
        contactPhone: registerData.contactPhone,
        referralCode: registerData.referralCode
      });
      setMessage({ type: "success", text: 'New OTP sent to your email.' });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || 'Error resending OTP.' });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post(`${apiUrl}/api/auth/company-admin`, formData);
      const { _id, name, role, profileImage } = response.data;
      localStorage.setItem('companyId', _id);
      localStorage.setItem('companyName', name);
      localStorage.setItem('userRole', role);
      if (profileImage) {
        localStorage.setItem('profileImage', profileImage);
      }
      
      setMessage({ type: "success", text: "Login successful! Redirecting..." });
      setTimeout(() => {
        navigate(`/company/${_id}/dashboard`);
      }, 1000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || 'Error during login.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep1 = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setEmailCheckLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post(`${apiUrl}/api/company/register/initiate`, {
        name: registerData.name,
        contactEmail: registerData.contactEmail,
        contactPhone: registerData.contactPhone,
        referralCode: registerData.referralCode
      });
      setMessage({ type: "success", text: res.data.message || 'OTP sent to your email.' });
      setRegisterStep(2);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || 'Error initiating registration.' });
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleRegisterStep2 = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const password = e.target.password.value;
      const confirmPassword = e.target.confirmPassword.value;
      if (password !== confirmPassword) {
        setMessage({ type: "error", text: 'Passwords do not match.' });
        return;
      }
      const res = await axios.post(`${apiUrl}/api/company/register/verify`, {
        email: registerData.contactEmail,
        otp: otpInputs.join(''),
        password,
        confirmPassword
      });
      setMessage({ type: "success", text: 'Registration successful! Redirecting to login...' });
      setTimeout(() => {
        switchView('login');
      }, 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || 'Error completing registration.' });
    } finally {
      setRegisterLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form className="space-y-4" onSubmit={handleLoginSubmit} autoComplete="off">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
          Email Address
                </label>
                <input
          id="login-email"
          name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.email ? "border-red-300" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
          placeholder="admin@company.com"
          autoComplete="off"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
        <div className="relative">
                <input
            id="login-password"
                  name="password"
            type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.password ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                  placeholder="Enter your password"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.38.283-2.694.793-3.88m2.387-3.274A9.978 9.978 0 0112 3c5.523 0 10 4.477 10 10 0 1.446-.31 2.824-.863 4.042M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 01-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c1.657 0 3.22.424 4.563 1.17M19.542 12C18.268 16.057 14.477 19 10 19c-1.657 0-3.22-.424-4.563-1.17" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

      <div className="flex items-center justify-end">
        <div className="text-sm">
          <a href="/company/forgot-password" className="font-medium text-green-600 hover:text-green-500">
            Forgot your password?
          </a>
        </div>
                </div>

      <div>
              <button
                type="submit"
                disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? "Signing In..." : "Sign In"}
              </button>
            </div>
    </form>
  );

  const renderRegisterStep1 = () => (
    <form className="space-y-4" onSubmit={handleRegisterStep1} autoComplete="off">
      <div>
        <label htmlFor="register-name" className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          id="register-name"
          name="name"
          type="text"
          value={registerData.name}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.name ? "border-red-300" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
          placeholder="Enter company name"
          autoComplete="off"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
          Contact Email
        </label>
        <input
          id="register-email"
          name="contactEmail"
          type="email"
          value={registerData.contactEmail}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.contactEmail ? "border-red-300" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
          placeholder="Enter contact email"
          autoComplete="off"
        />
        {errors.contactEmail && <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>}
      </div>

      <div>
        <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700">
          Contact Phone
        </label>
        <input
          id="register-phone"
          name="contactPhone"
          type="tel"
          value={registerData.contactPhone}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.contactPhone ? "border-red-300" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
          placeholder="Enter contact phone"
          autoComplete="off"
        />
        {errors.contactPhone && <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>}
                    </div>

      <div className="mb-4">
        <label htmlFor="referralCode" className="block text-sm font-medium text-gray-400">
          <i>Referral Code (optional)</i>
        </label>
        <input
          type="text"
          name="referralCode"
          id="referralCode"
          value={registerData.referralCode}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
          placeholder="Enter referral code"
        />
                    </div>

      <div>
                <button
          type="submit"
          disabled={emailCheckLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {emailCheckLoading ? "Verifying..." : "Next"}
                </button>
              </div>
            </form>
  );

  const renderRegisterStep2 = () => (
    <form className="space-y-4" onSubmit={handleRegisterStep2} autoComplete="off">
      <div>
        <p className="text-sm text-gray-600 mb-4">Enter the OTP sent to {registerData.contactEmail}</p>
        <div className="flex items-center gap-2 mb-4">
          {otpInputs.map((otp, index) => (
                    <input
                      key={index}
                      ref={el => otpInputRefs.current[index] = el}
              className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      type="text"
                      maxLength="1"
              value={otp}
                      onChange={(e) => handleOtpInputChange(e, index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
                          otpInputRefs.current[index - 1].focus();
                        }
                      }}
              autoComplete="one-time-code"
                    />
                  ))}
          <div className="flex items-center justify-center w-8 h-8">
            {otpStatus === 'verifying' && <span className="text-green-600">...</span>}
            {otpStatus === 'verified' && <span className="text-green-600">✅</span>}
            {otpStatus === 'error' && <span className="text-red-600">❌</span>}
          </div>
                  </div>
        <div className="text-right">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendDisabled}
            className="text-sm text-green-600 hover:text-green-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resendDisabled ? `Resend OTP (${resendTime}s)` : 'Resend OTP'}
                  </button>
        </div>
                </div>

      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
                  <input
          id="register-password"
                    name="password"
                    type="password"
                    required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          placeholder="Enter new password"
        />
      </div>

      <div>
        <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
                  <input
          id="register-confirm-password"
                    name="confirmPassword"
                    type="password"
                    required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          placeholder="Confirm new password"
                  />
                </div>

      <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterStep(1)}
          className="flex-1 py-2 px-4 border border-gray-300 text-sm font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                >
                  Back
                </button>
        <button
          type="submit"
          disabled={registerLoading || otpStatus !== 'verified'}
          className="flex-1 py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {registerLoading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/login_panel')}
        className="absolute top-6 left-6 inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-500 bg-white/80 hover:bg-white/90 rounded-lg shadow-sm transition-all duration-300 backdrop-blur-sm"
      >
        <FaArrowLeft className="mr-2 h-4 w-4" />
        Login Panel
      </button>

      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-8 py-10">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center text-green-600">
            <FaBuilding size={48} />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            {currentView === "login" ? "Company Admin Portal" : "Register Your Company"}
          </h2>
          <p className="text-gray-500 mt-2 text-base">
            {currentView === "login" 
              ? "Access your company dashboard" 
              : registerStep === 1 
                ? "Join our network of companies" 
                : "Verify your email and set password"
            }
          </p>
        </div>

        {message.text && (
          <div className={`rounded-md p-4 text-center ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}>
            <p className={`text-sm ${
              message.type === "success" ? "text-green-800" : "text-red-800"
            }`}>
              {message.text}
            </p>
          </div>
        )}

        {currentView === "login" && renderLoginForm()}
        {currentView === "register" && registerStep === 1 && renderRegisterStep1()}
        {currentView === "register" && registerStep === 2 && renderRegisterStep2()}

        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">
            {currentView === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => switchView(currentView === "login" ? "register" : "login")}
              className="font-bold text-green-600 hover:text-green-500 focus:outline-none"
            >
              {currentView === "login" ? "Register Company" : "Sign in"}
            </button>
          </p>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} Campus Recruitment Portal
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin; 