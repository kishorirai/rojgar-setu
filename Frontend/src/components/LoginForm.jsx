import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserGraduate, FaBuilding, FaUniversity, FaChartLine } from 'react-icons/fa';

const LoginForm = ({ type, apiEndpoint, redirectPath }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await axios.post(`${apiEndpoint}`, formData);
    const { token, user } = response.data;

    // if (!user) {
    //   setError('Invalid credentials.');
    //   setLoading(false);
    //   return;
    // }
    // console.log('Login successful:', response.data);

    // Save token and user info
    if (type === 'Sales') {
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", `${user.firstName} ${user.lastName}`);
    } else {
      localStorage.setItem(`${type.toLowerCase()}Id`, response.data.studentId);
      localStorage.setItem(`${type.toLowerCase()}Name`, response.data.studentName);
      localStorage.setItem(`${type.toLowerCase()}Email`, response.data.contactEmail);
    }

    // Navigate to appropriate dashboard
    if(type === 'Sales') {
      navigate(redirectPath);
    } else {
      navigate(redirectPath, { state: { user: response.data } });
    }
  } catch (err) {
    console.error('Login error:', err);
    setError(err.response?.data?.msg || 'Error during login. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <>
     {/* <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F3F4F6',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        padding: '3rem',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}> */}
        {/* <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            color: color,
            fontSize: '4rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'center'
          }}>
            Icon removed because it is not used 
          </div>

          </div> 
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1F2937',
            marginBottom: '1rem'
          }}>
            {title}
          </h1>
          <p style={{
            color: '#6B7280',
            fontSize: '1.1rem'
          }}>
            {description}
          </p>
        </div> */}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              color: '#374151',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid #D1D5DB',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                ':focus': {
                  borderColor: "#3B82F6"
                }
              }}
              placeholder={`Enter your ${type.toLowerCase()} email`}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              color: '#374151',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid #D1D5DB',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                ':focus': {
                  borderColor: "#3B82F6"
                }
              }}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div style={{
              color: '#DC2626',
              fontSize: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              padding: '1rem',
              background: '#FEE2E2',
              borderRadius: '0.5rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: "#3B82F6",
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '1rem',
          color: '#6B7280'
        }}>
          <p>Don't have an account? Contact your administrator</p>
        </div> */}
       {/* </div>
    </div> */}
    </>
  );
};

export default LoginForm; 