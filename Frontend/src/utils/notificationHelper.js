import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a notification
export const createNotification = async (notificationData) => {
  try {
    const response = await axios.post(`${apiUrl}/api/notifications`, notificationData, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Find user by email
export const findUserByEmail = async (email) => {
  try {
    const response = await axios.get(`${apiUrl}/api/notifications/find-user/${email}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
};

// Search users by name
export const searchUsersByName = async (query, type = null) => {
  try {
    const params = type ? `?type=${type}` : '';
    const url = `${apiUrl}/api/notifications/search-users/${query}${params}`;
    console.log('Searching users with URL:', url); // Debug log
    
    const response = await axios.get(url, { withCredentials: true });
    console.log('Search response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Create notification for college
export const createCollegeNotification = async (collegeId, title, message, type = 'info', actionUrl = null, metadata = {}) => {
  return createNotification({
    recipient: collegeId,
    recipientModel: 'College',
    title,
    message,
    type,
    actionUrl,
    metadata
  });
};

// Create notification for student
export const createStudentNotification = async (studentId, title, message, type = 'info', actionUrl = null, metadata = {}) => {
  return createNotification({
    recipient: studentId,
    recipientModel: 'Student',
    title,
    message,
    type,
    actionUrl,
    metadata
  });
};

// Create notification for company
export const createCompanyNotification = async (companyId, title, message, type = 'info', actionUrl = null, metadata = {}) => {
  return createNotification({
    recipient: companyId,
    recipientModel: 'Company',
    title,
    message,
    type,
    actionUrl,
    metadata
  });
};

// Create notification by email (new function)
export const createNotificationByEmail = async (senderId, senderType, recipientEmail, recipientType, title, message, type = 'info', actionUrl = null, metadata = {}) => {
  return createNotification({
    sender: senderId,
    senderModel: senderType.charAt(0).toUpperCase() + senderType.slice(1),
    recipientEmail,
    recipientType,
    title,
    message,
    type,
    actionUrl,
    metadata
  });
};

// Get unread count for a user
export const getUnreadCount = async (userType, userId) => {
  try {
    const response = await axios.get(`${apiUrl}/api/notifications/${userType}/${userId}/unread-count`, { withCredentials: true });
    return response.data.unreadCount;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.patch(`${apiUrl}/api/notifications/${notificationId}/read`, {}, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (userType, userId) => {
  try {
    const response = await axios.patch(`${apiUrl}/api/notifications/${userType}/${userId}/read-all`, {}, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Predefined notification templates
export const notificationTemplates = {
  // Student verification
  studentVerified: (studentName) => ({
    title: 'Student Verified',
    message: `${studentName} has been successfully verified by the college.`,
    type: 'success'
  }),

  // New job application
  newJobApplication: (jobTitle, companyName) => ({
    title: 'New Job Application',
    message: `A student has applied for ${jobTitle} at ${companyName}.`,
    type: 'info'
  }),

  // Interview scheduled
  interviewScheduled: (studentName, companyName, date) => ({
    title: 'Interview Scheduled',
    message: `Interview scheduled for ${studentName} with ${companyName} on ${date}.`,
    type: 'info'
  }),

  // Placement success
  placementSuccess: (studentName, companyName, role) => ({
    title: 'Placement Success',
    message: `Congratulations! ${studentName} has been placed at ${companyName} as ${role}.`,
    type: 'success'
  }),

  // System alert
  systemAlert: (message) => ({
    title: 'System Alert',
    message,
    type: 'warning'
  }),

  // Error notification
  errorNotification: (message) => ({
    title: 'Error',
    message,
    type: 'error'
  })
};

// Helper function to create notifications using templates
export const createNotificationFromTemplate = async (templateName, recipientType, recipientId, ...args) => {
  const template = notificationTemplates[templateName];
  if (!template) {
    throw new Error(`Notification template '${templateName}' not found`);
  }

  const notificationData = template(...args);
  
  switch (recipientType) {
    case 'college':
      return createCollegeNotification(recipientId, notificationData.title, notificationData.message, notificationData.type);
    case 'student':
      return createStudentNotification(recipientId, notificationData.title, notificationData.message, notificationData.type);
    case 'company':
      return createCompanyNotification(recipientId, notificationData.title, notificationData.message, notificationData.type);
    default:
      throw new Error(`Invalid recipient type: ${recipientType}`);
  }
};

// Helper function to create notifications by email using templates
export const createNotificationByEmailFromTemplate = async (templateName, senderId, senderType, recipientEmail, recipientType, ...args) => {
  const template = notificationTemplates[templateName];
  if (!template) {
    throw new Error(`Notification template '${templateName}' not found`);
  }

  const notificationData = template(...args);
  return createNotificationByEmail(
    senderId,
    senderType,
    recipientEmail,
    recipientType,
    notificationData.title,
    notificationData.message,
    notificationData.type
  );
};

export default {
  createNotification,
  findUserByEmail,
  searchUsersByName,
  createCollegeNotification,
  createStudentNotification,
  createCompanyNotification,
  createNotificationByEmail,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  notificationTemplates,
  createNotificationFromTemplate,
  createNotificationByEmailFromTemplate
}; 