import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(3);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getLoginRoute = () => {
    const path = location.pathname;
    if (path.includes('/company/')) return '/company-login';
    if (path.includes('/college/')) return '/college-login';
    if (path.includes('/student/')) return '/student-login';
    return '/login_panel'; // fallback
  };

  const startRedirectCountdown = () => {
    let counter = 3;
    setCountdown(counter);

    const interval = setInterval(() => {
      counter -= 1;
      setCountdown(counter);
      if (counter === 0) {
        clearInterval(interval);
        const loginRoute = getLoginRoute();
        navigate(loginRoute);
      }
    }, 1000);
  };

  useEffect(() => {
    axios.get(`${apiUrl}/api/auth/check-bypass-auth`, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          setAuthorized(true);
        }
      })
      .catch((err) => {
        // Handle known error status codes
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Unauthorized access');
        } else {
          setError('Access Denied. Login required or server error');
        }

        // Optionally delay redirect or allow user to see the message
        startRedirectCountdown();
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="bg-white/90 shadow-lg rounded-xl p-8 max-w-md w-full mx-4 border border-blue-200 flex flex-col items-center">
        <div className="relative w-12 h-12">
          <svg className="animate-spin absolute inset-0 h-full w-full text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          </svg>
          <svg className="animate-spin absolute inset-0 h-full w-full text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-blue-600 mb-2 mt-4">Checking Authorization...</h2>
        <p className="text-gray-500 text-center">Please wait while we verify your access.</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-red-200">
      <div className="bg-white/90 shadow-lg rounded-xl p-8 max-w-md w-full mx-4 border border-red-200 flex flex-col items-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-red-500 mb-4 text-center">{error}</p>
        <p className="text-gray-500 text-sm">Redirecting to login... &nbsp;&nbsp;&nbsp;&nbsp;<i style={{ color: 'gray', fontSize: '1.55rem' }}>{countdown}</i></p>
      </div>
    </div>
  );

  return authorized ? children : null;
};

export default ProtectedRoute;
