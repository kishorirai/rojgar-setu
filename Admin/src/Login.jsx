import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaBuilding, FaUniversity, FaChartLine } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();

  const loginOptions = [
    {
      title: 'Admin Login',
      description: 'Access your admin dashboard',
      icon: FaBuilding,
      color: '#3B82F6',
      path: '/login'
    },
    {
      title: 'Sales Login',
      description: 'Access your sales dashboard',
      icon: FaChartLine,
      color: '#8B5CF6',
      url: 'https://www.rojgarsetu.org/sales-login' //<- this url is for the external project
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F3F4F6',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#1F2937',
          marginBottom: '1rem'
        }}>
          ROJGAR SETU
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#6B7280',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Your one-stop platform for campus placements and career opportunities
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '2rem',
        maxWidth: '1000px',
        width: '100%',
        padding: '0 1rem',
        margin: '0 auto'
      }}>
        {loginOptions.map((option, index) => (
          <div
            key={index}
            onClick={() => {
              if (option.url) {
                window.location.href = option.url; // redirects to external project
              } else {
                navigate(option.path); // internal routing
              }
            }}
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '250px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              color: option.color,
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <option.icon size={48} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1F2937',
              marginBottom: '0.75rem'
            }}>
              {option.title}
            </h2>
            <p style={{
              color: '#6B7280',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              {option.description}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '3rem',
        textAlign: 'center',
        color: '#6B7280',
        fontSize: '0.875rem'
      }}>
        <p>Don't have an account? Contact your administrator</p>
      </div>
    </div>
  );
};

export default Login; 