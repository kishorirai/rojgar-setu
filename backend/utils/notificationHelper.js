const Notification = require('../models/Notification');
const Student = require('../models/Student');
const College = require('../models/College');
const Company = require('../models/Company');

/**
 * Create a notification for a student
 * @param {string} studentId - Student's ObjectId
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 */
async function createStudentNotification(studentId, title, message, options = {}) {
  try {
    const notification = new Notification({
      sender: options.senderId || null,
      senderModel: options.senderModel || 'System',
      recipient: studentId,
      recipientModel: 'Student',
      title,
      message,
      type: options.type || 'info',
      priority: options.priority || 'normal',
      category: options.category || 'general',
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      metadata: options.metadata || {},
      expiresAt: options.expiresAt
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating student notification:', error);
    throw error;
  }
}

/**
 * Create a notification for a college
 * @param {string} collegeId - College's ObjectId
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 */
async function createCollegeNotification(collegeId, title, message, options = {}) {
  try {
    const notification = new Notification({
      sender: options.senderId || null,
      senderModel: options.senderModel || 'System',
      recipient: collegeId,
      recipientModel: 'College',
      title,
      message,
      type: options.type || 'info',
      priority: options.priority || 'normal',
      category: options.category || 'general',
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      metadata: options.metadata || {},
      expiresAt: options.expiresAt
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating college notification:', error);
    throw error;
  }
}

/**
 * Create a notification for a company
 * @param {string} companyId - Company's ObjectId
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 */
async function createCompanyNotification(companyId, title, message, options = {}) {
  try {
    const notification = new Notification({
      sender: options.senderId || null,
      senderModel: options.senderModel || 'System',
      recipient: companyId,
      recipientModel: 'Company',
      title,
      message,
      type: options.type || 'info',
      priority: options.priority || 'normal',
      category: options.category || 'general',
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      metadata: options.metadata || {},
      expiresAt: options.expiresAt
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating company notification:', error);
    throw error;
  }
}

/**
 * Create a notification by email (finds user by email)
 * @param {string} recipientEmail - Recipient's email
 * @param {string} recipientType - 'student', 'college', or 'company'
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 */
async function createNotificationByEmail(recipientEmail, recipientType, title, message, options = {}) {
  try {
    let recipientId;
    let recipientModel;

    switch (recipientType.toLowerCase()) {
      case 'student':
        const student = await Student.findOne({ email: recipientEmail });
        if (!student) {
          throw new Error(`Student not found with email: ${recipientEmail}`);
        }
        recipientId = student._id;
        recipientModel = 'Student';
        break;

      case 'college':
        const college = await College.findOne({ contactEmail: recipientEmail });
        if (!college) {
          throw new Error(`College not found with email: ${recipientEmail}`);
        }
        recipientId = college._id;
        recipientModel = 'College';
        break;

      case 'company':
        const company = await Company.findOne({ contactEmail: recipientEmail });
        if (!company) {
          throw new Error(`Company not found with email: ${recipientEmail}`);
        }
        recipientId = company._id;
        recipientModel = 'Company';
        break;

      default:
        throw new Error(`Invalid recipient type: ${recipientType}`);
    }

    const notification = new Notification({
      sender: options.senderId || null,
      senderModel: options.senderModel || 'System',
      recipient: recipientId,
      recipientModel,
      title,
      message,
      type: options.type || 'info',
      priority: options.priority || 'normal',
      category: options.category || 'general',
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      metadata: options.metadata || {},
      expiresAt: options.expiresAt
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification by email:', error);
    throw error;
  }
}

/**
 * Create bulk notifications for multiple recipients
 * @param {Array} recipients - Array of recipient objects with id and model
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 */
async function createBulkNotifications(recipients, title, message, options = {}) {
  try {
    const notifications = recipients.map(recipient => ({
      sender: options.senderId || null,
      senderModel: options.senderModel || 'System',
      recipient: recipient.id,
      recipientModel: recipient.model,
      title,
      message,
      type: options.type || 'info',
      priority: options.priority || 'normal',
      category: options.category || 'general',
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      metadata: options.metadata || {},
      expiresAt: options.expiresAt
    }));

    const savedNotifications = await Notification.insertMany(notifications);
    return savedNotifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

/**
 * Create a system-wide announcement notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 */
async function createSystemAnnouncement(title, message, options = {}) {
  try {
    // Get all students, colleges, and companies
    const students = await Student.find({}, '_id');
    const colleges = await College.find({}, '_id');
    const companies = await Company.find({}, '_id');

    const recipients = [
      ...students.map(s => ({ id: s._id, model: 'Student' })),
      ...colleges.map(c => ({ id: c._id, model: 'College' })),
      ...companies.map(c => ({ id: c._id, model: 'Company' }))
    ];

    return await createBulkNotifications(recipients, title, message, {
      ...options,
      category: 'announcement',
      type: 'info'
    });
  } catch (error) {
    console.error('Error creating system announcement:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification's ObjectId
 */
async function markNotificationAsRead(notificationId) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User's ObjectId
 * @param {string} userModel - User's model ('Student', 'College', 'Company')
 */
async function markAllNotificationsAsRead(userId, userModel) {
  try {
    const result = await Notification.updateMany(
      {
        recipient: userId,
        recipientModel: userModel,
        read: false
      },
      { read: true, readAt: new Date() }
    );
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete expired notifications
 */
async function cleanupExpiredNotifications() {
  try {
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log(`Cleaned up ${result.deletedCount} expired notifications`);
    return result;
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    throw error;
  }
}

module.exports = {
  createStudentNotification,
  createCollegeNotification,
  createCompanyNotification,
  createNotificationByEmail,
  createBulkNotifications,
  createSystemAnnouncement,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  cleanupExpiredNotifications
}; 