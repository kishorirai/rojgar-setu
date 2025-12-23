const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testDashboardAPI = async () => {
  try {
    console.log('Connecting to database...');
    
    // Find the student by email
    const student = await Student.findOne({ email: 'kishorirai02@gmail.com' });
    
    if (!student) {
      console.log('Student with email kishorirai02@gmail.com not found!');
      return;
    }

    console.log(`Found student: ${student.name} (${student.email})`);
    console.log(`Student ObjectId: ${student._id}`);

    // Generate a JWT token for this student
    const token = jwt.sign(
      {
        id: student._id,
        name: student.name,
        email: student.email,
        type: 'student'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Simulate the dashboard controller logic
    const userId = student._id;
    
    // Fetch notifications (same logic as dashboard controller)
    const notifications = await Notification.find({
      recipient: userId,
      recipientModel: 'Student',
      // Only show non-expired notifications
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .populate('sender', 'name email contactEmail')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    console.log(`\nRaw notifications from database: ${notifications.length}`);
    notifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title} (${notification.read ? 'Read' : 'Unread'})`);
    });

    // Transform notifications (same logic as dashboard controller)
    const notificationsList = notifications.map(notification => ({
      id: notification._id,
      date: new Date(notification.createdAt).toLocaleDateString(),
      text: notification.message,
      title: notification.title,
      type: notification.type,
      category: notification.category,
      read: notification.read,
      sender: notification.sender ? notification.sender.name || notification.sender.email : 'System',
      actionUrl: notification.actionUrl,
      actionText: notification.actionText
    }));

    console.log(`\nTransformed notificationsList: ${notificationsList.length}`);
    notificationsList.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title} (${notification.read ? 'Read' : 'Unread'})`);
      console.log(`   - id: ${notification.id}`);
      console.log(`   - text: ${notification.text}`);
      console.log(`   - type: ${notification.type}`);
      console.log(`   - category: ${notification.category}`);
      console.log(`   - read: ${notification.read}`);
      console.log('   ---');
    });

    // Simulate the full dashboard response
    const dashboardResponse = {
      student: { name: student.name, email: student.email },
      profileCompletion: 0,
      opportunitiesOverview: { total: 0, saved: 0 },
      applicationsOverview: [],
      kycStatus: student.kycStatus,
      notificationsList,
      recentFeedback: [],
      interviewSchedule: []
    };

    console.log(`\nDashboard response notificationsList length: ${dashboardResponse.notificationsList.length}`);
    console.log('Dashboard response structure:');
    console.log(JSON.stringify(dashboardResponse, null, 2));

  } catch (error) {
    console.error('Error testing dashboard API:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the script
testDashboardAPI(); 