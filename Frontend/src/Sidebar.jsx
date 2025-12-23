import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

/**
 * Sidebar component for campus applications
 * @param {Object} props
 * @param {Array} props.navItems - Navigation items [{label, icon, href}]
 * @param {Object} props.user - User object {initials, name, role}
 * @param {string} [props.sectionLabel] - Section label (default: 'CAMPUS SERVICES')
 */
const Sidebar = ({ navItems = [], user = { initials: '', name: '', role: '' }, sectionLabel = 'CAMPUS SERVICES' }) => {
  const location = useLocation();
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('profileImage'));

  useEffect(() => {
    const handleStorage = () => {
      setProfileImage(localStorage.getItem('profileImage'));
    };
    window.addEventListener('storage', handleStorage);
    // Also update on mount in case localStorage changed before mount
    setProfileImage(localStorage.getItem('profileImage'));
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <aside style={{
      width: 260,
      background: '#2046c8',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      boxShadow: '2px 0 8px #0001',
      position: 'fixed',
      top: 0
    }}>
      <div>
        <div style={{
          width: '100%',
          fontWeight: 800,
          fontSize: 18,
          padding: '1.5rem 2rem 1rem 2rem',
          letterSpacing: 0.5,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.2,
        }}>
          ROJGAR SETU
        </div>
        <div style={{ color: '#c7d2fe', fontWeight: 700, fontSize: 13, padding: '0 2rem', marginTop: 18, marginBottom: 16, letterSpacing: 1 }}>
          {sectionLabel}
        </div>
        <nav style={{ marginTop: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 2rem',
                  color: isActive ? '#fff' : '#c7d2fe',
                  textDecoration: 'none',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 16,
                  borderLeft: isActive ? '4px solid #fff' : '4px solid transparent',
                  background: isActive ? '#1e40af' : 'transparent',
                  marginBottom: 2,
                  cursor: 'pointer',
                  borderRadius: '0 8px 8px 0',
                  transition: 'background 0.18s, border 0.18s, color 0.18s',
                  maxWidth: 220,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                onMouseOver={e => {
                  if (!isActive) e.currentTarget.style.background = '#233e8b';
                }}
                onMouseOut={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: 20, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      {/* User Profile */}
      <div style={{
        padding: '1.5rem 2rem',
        borderTop: '1px solid #3b82f6',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#2046c8',
      }}>
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            style={{
              height: 40,
              width: 40,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #fff',
              background: '#fff',
            }}
          />
        ) : (
          <div style={{
            height: 40,
            width: 40,
            borderRadius: '50%',
            background: '#fff',
            color: '#2046c8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18
          }}>{user.initials}</div>
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{user.name}</div>
          <div style={{ fontSize: 13, color: '#c7d2fe' }}>{user.role}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 