import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes, FaCheck, FaExclamationTriangle, FaPlus, FaSearch, FaUser, FaBuilding, FaGraduationCap } from 'react-icons/fa';
import axios from 'axios';
import { createNotification, findUserByEmail, searchUsersByName } from '../utils/notificationHelper';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const NotificationDropdown = ({ userId, userType = 'college' }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    message: '',
    category: 'general',
    recipientType: 'college',
    recipientEmail: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchingByName, setSearchingByName] = useState(false);
  const [showExpandedView, setShowExpandedView] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSentMessages, setShowSentMessages] = useState(false);
  const [sentMessages, setSentMessages] = useState([]);
  const [loadingSentMessages, setLoadingSentMessages] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/notifications/${userType}/${userId}`);
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`${apiUrl}/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.patch(`${apiUrl}/api/notifications/${userType}/${userId}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Search for user by email
  const handleEmailChange = async (email) => {
    setCreateForm({ ...createForm, recipientEmail: email });
    
    // Clear previous results
    setFoundUser(null);
    setSearchError('');
    
    if (!email || email.length < 3) {
      return;
    }
    
    try {
      setSearchingUser(true);
      const result = await findUserByEmail(email);
      
      if (result.found) {
        setFoundUser(result.user);
        setSearchError('');
        // Set the search query to the user's name
        setSearchQuery(result.user.name);
      } else {
        setFoundUser(null);
        setSearchError('User not found with this email');
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setFoundUser(null);
      setSearchError('Error searching for user');
      setSearchQuery('');
    } finally {
      setSearchingUser(false);
    }
  };

  // Search users by name
  const searchUsersByNameHandler = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchingByName(true);
      const result = await searchUsersByName(query, createForm.recipientType);
      setSearchResults(result.results || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching users by name:', error);
      setSearchResults([]);
    } finally {
      setSearchingByName(false);
    }
  };

  // Select user from search results
  const selectUser = (user) => {
    setCreateForm({ ...createForm, recipientEmail: user.email });
    setFoundUser(user);
    setSearchError('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchQuery(user.name);
  };

  // Create notification
  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate required fields
    const errors = {};
    if (!createForm.title.trim()) errors.title = 'Title is required';
    if (!createForm.message.trim()) errors.message = 'Message is required';
    if (!createForm.recipientEmail) errors.recipientEmail = 'Recipient email is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (createForm.recipientEmail && !emailRegex.test(createForm.recipientEmail)) {
      errors.recipientEmail = 'Please enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const notificationData = {
        sender: userId,
        senderModel: userType.charAt(0).toUpperCase() + userType.slice(1),
        recipientEmail: createForm.recipientEmail,
        recipientType: createForm.recipientType,
        title: createForm.title,
        message: createForm.message,
        category: createForm.category
      };

      await createNotification(notificationData);
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form and close modal after 2 seconds
      setTimeout(() => {
        setCreateForm({
          title: '',
          message: '',
          category: 'general',
          recipientType: 'college',
          recipientEmail: ''
        });
        setFoundUser(null);
        setSearchError('');
        setSearchResults([]);
        setShowSearchResults(false);
        setSearchQuery('');
        setShowCreateModal(false);
        setShowSuccess(false);
      }, 2000);
      
      // Refresh notifications
      await fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      setValidationErrors({ general: error.response?.data?.message || 'Failed to create notification' });
    }
  };

  // Handle name search input change
  const handleNameSearchChange = (query) => {
    setSearchQuery(query);
    
    // Clear results if query is too short
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchUsersByNameHandler(query);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  // Get user type icon
  const getUserTypeIcon = (type) => {
    switch (type) {
      case 'college':
        return <FaGraduationCap style={{ color: '#3b82f6' }} />;
      case 'company':
        return <FaBuilding style={{ color: '#10b981' }} />;
      case 'student':
        return <FaUser style={{ color: '#f59e0b' }} />;
      default:
        return <FaUser style={{ color: '#6b7280' }} />;
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheck className="text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'error':
        return <FaTimes className="text-red-500" />;
      default:
        return <FaBell className="text-blue-500" />;
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Add delete function after markAsRead function
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${apiUrl}/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Add function to fetch sent messages
  const fetchSentMessages = async () => {
    try {
      setLoadingSentMessages(true);
      const response = await axios.get(`${apiUrl}/api/notifications/sent/${userType}/${userId}`);
      setSentMessages(response.data);
    } catch (error) {
      console.error('Error fetching sent messages:', error);
    } finally {
      setLoadingSentMessages(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
        style={{
          position: 'relative',
          padding: '8px',
          color: '#6b7280',
          cursor: 'pointer',
          borderRadius: '50%',
          transition: 'all 0.2s ease',
          border: 'none',
          background: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.target.style.color = '#374151';
          e.target.style.backgroundColor = '#f3f4f6';
        }}
        onMouseLeave={(e) => {
          e.target.style.color = '#6b7280';
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '12px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '18px',
              height: '18px',
              padding: '2px'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden notification-dropdown"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            width: '400px',
            minWidth: '400px',
            maxWidth: '400px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            zIndex: 1500,
            maxHeight: '384px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b border-gray-200"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              flexShrink: 0
            }}
          >
            <h3
              className="text-lg font-semibold text-gray-900"
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#111827'
              }}
            >
              Notifications
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Sent Messages Button */}
              <button
                onClick={() => {
                  setShowSentMessages(true);
                  fetchSentMessages();
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#374151';
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#6b7280';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Sent Messages
              </button>
              {/* Create Notification Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: '6px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                <FaPlus size={12} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            minHeight: 0
          }}>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b border-gray-100 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  } ${notification.actionUrl ? 'hover:bg-blue-100 cursor-pointer' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    if (notification.actionUrl) {
                      navigate(notification.actionUrl);
                    }
                  }}
                  style={notification.actionUrl ? { cursor: 'pointer' } : {}}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Sender Info in one line */}
                      {notification.sender && (
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <span className="font-semibold truncate">
                            {notification.sender.name}
                          </span>
                          <span className="text-gray-500 truncate">
                            ({notification.sender.contactEmail || notification.sender.email})
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <h4 className="text-sm font-bold italic text-gray-900 truncate">
                        {notification.title}
                        </h4>
                        <span className="text-xs italic text-gray-500 whitespace-nowrap">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={e => { e.stopPropagation(); markAsRead(notification._id); }}
                          className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - Always visible */}
          <div
            className="p-3 border-t border-gray-200"
            style={{
              padding: '12px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: 'white',
              position: 'sticky',
              bottom: 0,
              zIndex: 1,
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <button
              onClick={() => {
                setShowExpandedView(true);
                setIsOpen(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
              style={{
                fontSize: '14px',
                color: '#6b7280',
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                padding: '4px 8px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#374151';
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#6b7280';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              View all notifications
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
                style={{
                  fontSize: '14px',
                  color: '#2563eb',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#1d4ed8';
                  e.target.style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#2563eb';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Mark all read
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                Send Message
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFoundUser(null);
                  setSearchError('');
                  setSearchResults([]);
                  setShowSearchResults(false);
                  setSearchQuery('');
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <FaTimes />
              </button>
            </div>

            {showSuccess && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <FaCheck style={{ color: '#16a34a', fontSize: '24px' }} />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  Message Sent Successfully!
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  Your message has been delivered to the recipient.
                </p>
              </div>
            )}

            <form onSubmit={handleCreateNotification}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: validationErrors.title ? '1px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                    placeholder="Enter notification title"
                    maxLength={200}
                  />
                  {validationErrors.title && (
                    <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {validationErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                    Message *
                  </label>
                  <textarea
                    value={createForm.message}
                    onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: validationErrors.message ? '1px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                    placeholder="Enter notification message"
                    maxLength={1000}
                  />
                  {validationErrors.message && (
                    <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {validationErrors.message}
                    </p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                      Category
                    </label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="academic">Academic</option>
                      <option value="placement">Placement</option>
                      <option value="system">System</option>
                      <option value="announcement">Announcement</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                      Recipient Type
                    </label>
                    <select
                      value={createForm.recipientType}
                      onChange={(e) => {
                        setCreateForm({ ...createForm, recipientType: e.target.value, recipientEmail: '' });
                        setSearchResults([]);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="college">College</option>
                      <option value="student">Student</option>
                      <option value="company">Company</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                    Search by Name
                  </label>
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleNameSearchChange(e.target.value)}
                        placeholder="Search by Name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {searchingByName && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      )}
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                        {searchResults.map((result, index) => (
                          <div
                            key={`${result.type}-${result.id}`}
                            onClick={() => selectUser(result)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {result.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {result.contactEmail || result.email}
                                </p>
                                {result.location && (
                                  <p className="text-xs text-gray-400 truncate">
                                    {result.location}
                                  </p>
                                )}
                              </div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {result.type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                    Recipient Email *
                  </label>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={createForm.recipientEmail}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="Enter recipient email"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {validationErrors.recipientEmail && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.recipientEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Selected User Details */}
                {foundUser && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Selected: {foundUser.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {foundUser.contactEmail || foundUser.email}
                        </p>
                        {foundUser.location && (
                          <p className="text-xs text-gray-400">
                            Location: {foundUser.location}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {foundUser.type}
                      </span>
                    </div>
                  </div>
                )}

                {validationErrors.general && (
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '14px'
                  }}>
                    {validationErrors.general}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFoundUser(null);
                      setSearchError('');
                      setSearchResults([]);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                  style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expanded Notifications Modal */}
      {showExpandedView && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: 'white',
              position: 'sticky',
              top: 0,
              zIndex: 2
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                All Notifications
              </h2>
              <button
                onClick={() => {
                  setShowExpandedView(false);
                  setIsOpen(true);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <FaTimes />
              </button>
                </div>

            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              paddingRight: '8px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db #f3f4f6',
              '&::-webkit-scrollbar': {
                width: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f3f4f6',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#d1d5db',
                borderRadius: '4px',
                '&:hover': {
                  background: '#9ca3af'
                }
              }
            }}>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-b border-gray-100 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    } ${notification.actionUrl ? 'hover:bg-blue-100 cursor-pointer' : 'hover:bg-gray-50'}`}
                    onClick={() => {
                      if (notification.actionUrl) {
                        navigate(notification.actionUrl);
                      }
                    }}
                    style={notification.actionUrl ? { cursor: 'pointer' } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Sender Info at the top */}
                        {notification.sender && (
                          <div className="mb-1 text-sm font-semibold text-gray-900">
                            {notification.sender.name}
                            <span className="ml-2 text-xs font-normal text-gray-500">
                              ({notification.sender.contactEmail || notification.sender.email})
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold italic text-gray-900 truncate">
                          {notification.title}
                          </h4>
                          <span className="text-xs italic text-gray-500 whitespace-nowrap">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          {!notification.read && (
                            <button
                              onClick={e => { e.stopPropagation(); markAsRead(notification._id); }}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); deleteNotification(notification._id); }}
                            className="text-xs font-medium text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sent Messages Modal */}
      {showSentMessages && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                Sent Messages
              </h2>
              <button
                onClick={() => {
                  setShowSentMessages(false);
                  setIsOpen(true);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              paddingRight: '8px'
            }}>
              {loadingSentMessages ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : sentMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No sent messages
                </div>
              ) : (
                sentMessages.map((message) => (
                  <div
                    key={message._id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(message.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Recipient Info */}
                        <div className="mb-1 text-sm font-semibold text-gray-900">
                          To: {message.recipient?.name || 'Unknown Recipient'}
                          <span className="ml-2 text-xs font-normal text-gray-500">
                            ({message.recipient?.contactEmail || message.recipient?.email || message.recipientEmail})
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold italic text-gray-900 truncate">
                            {message.title}
                          </h4>
                          <span className="text-xs italic text-gray-500 whitespace-nowrap">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {message.message}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <button
                            onClick={() => deleteNotification(message._id)}
                            className="text-xs font-medium text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 