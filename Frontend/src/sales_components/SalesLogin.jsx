import React from 'react';
import { FaChartLine } from 'react-icons/fa';
import LoginForm from '../components/LoginForm';

const SalesLogin = () => {
  return (
    <div style={{
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
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <div style={{
                color: "#8B5CF6",
                fontSize: '4rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <FaChartLine />
              </div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1F2937',
                marginBottom: '1rem'
              }}>
                Sales Login
              </h1>
              <p style={{
                color: '#6B7280',
                fontSize: '1.1rem'
              }}>
                Sign in to access your sales dashboard
              </p>
            </div>
              <LoginForm
                type="Sales"
                apiEndpoint="https://campusadmin.onrender.com/api/v1/user/login"
                redirectPath="/support"
              />
          </div>
        </div>
  );
};

export default SalesLogin; 