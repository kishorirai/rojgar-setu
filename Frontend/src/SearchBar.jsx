import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaBell, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationDropdown from './components/NotificationDropdown';
import axios from 'axios';
axios.defaults.withCredentials = true; // Ensure cookies are sent with requests
const SearchBar = ({ onSettingsClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're in company context
  const isCompanyContext = location.pathname.includes('/company/');
  const isCollegeContext = location.pathname.includes('/college/');
  
  // Get user data based on context
  const userName = isCompanyContext 
    ? localStorage.getItem('companyName') 
    : localStorage.getItem('collegeName') || 'Admin';
  
  const initials = userName ? userName.substring(0, 2).toUpperCase() : 'AD';

  // Get user ID and type for notifications
  const getUserIdAndType = () => {
    if (isCompanyContext) {
      const companyId = localStorage.getItem('companyId');
      return { userId: companyId, userType: 'company' };
    } else if (isCollegeContext) {
      const collegeId = localStorage.getItem('collegeId');
      return { userId: collegeId, userType: 'college' };
    }
    return { userId: null, userType: null };
  };

  const { userId, userType } = getUserIdAndType();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
    // 1. Call backend logout route to clear the cookie
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {});
      localStorage.clear();
      navigate('/login_panel');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleSettingsClick = () => {
    setShowDropdown(false);
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      // Fallback to navigation if no handler provided
      navigate('/settings');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#fff',
      padding: '1.2rem 2rem 1.2rem 0',
      borderBottom: '1px solid #e5e7eb',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      minHeight: 64,
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f8fafc',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '0.5rem 1rem',
          minWidth: 320,
          maxWidth: 400,
          width: '100%',
          marginLeft: '20px',
        }}>
          <FaSearch style={{ color: '#94a3b8', fontSize: 18 }} />
          <input
            type="text"
            placeholder="Search..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 16,
              color: '#334155',
              width: '100%',
            }}
          />
        </div>
      </div>
      {/* Icons on the right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginLeft: 24 }}>
        {/* Notification Dropdown */}
        {userId && userType && (
          <NotificationDropdown userId={userId} userType={userType} />
        )}
        
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div style={{ 
            width: 40, 
            height: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '50%',
            background: '#fff',
            color: '#2046c8',
            fontWeight: 700,
            fontSize: 18,
            border: '2px solid #e5e7eb',
            transition: 'border-color 0.2s ease'
          }}
          onClick={() => setShowDropdown(!showDropdown)}
          onMouseOver={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseOut={e => e.currentTarget.style.borderColor = '#e5e7eb'}
          >
            {initials}
          </div>
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              minWidth: 200,
              border: '1px solid #e5e7eb',
              zIndex: 1999
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e5e7eb',
                color: '#1f2937',
                fontWeight: 600,
                fontSize: 14
              }}>
                {userName}
              </div>
              <div style={{ padding: 8 }}>
                <button
                  onClick={handleSettingsClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    background: 'transparent',
                    color: '#4b5563',
                    fontSize: 14,
                    cursor: 'pointer',
                    borderRadius: 6,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#f3f4f6';
                    e.currentTarget.style.color = '#6366f1';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#4b5563';
                  }}
                >
                  <FaCog style={{ fontSize: 16 }} />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: 14,
                    cursor: 'pointer',
                    borderRadius: 6,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.color = '#dc2626';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                >
                  <FaSignOutAlt style={{ fontSize: 16 }} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar; 
