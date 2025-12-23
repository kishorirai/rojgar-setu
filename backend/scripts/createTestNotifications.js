const mongoose = require('mongoose');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createTestNotifications = async () => {
  try {
    console.log('Connecting to database...');
    
    // Find the student by email
    const student = await Student.findOne({ email: 'kishorirai02@gmail.com' });
    
    if (!student) {
      console.log('Student with email kishorirai02@gmail.com not found!');
      console.log('Available students:');
      const allStudents = await Student.find({}, 'name email');
      allStudents.forEach(s => console.log(`- ${s.name} (${s.email})`));
      process.exit(1);
    }

    console.log(`Found student: ${student.name} (${student.email})`);
    console.log(`Student ID: ${student._id}`);

    // Clear existing notifications for this student
    await Notification.deleteMany({ 
      recipient: student._id, 
      recipientModel: 'Student' 
    });
    console.log('Cleared existing notifications for the student');

    // Create test notifications
    const testNotifications = [
      {
        recipient: student._id,
        recipientModel: 'Student',
        senderModel: 'System',
        title: 'Welcome to Campus Admin!',
        message: 'Hi Kishori! Welcome to your student dashboard. We\'re excited to have you on board. Complete your profile to get started with amazing opportunities.',
        type: 'success',
        category: 'general',
        priority: 'high',
        actionUrl: '/studentProfile',
        actionText: 'Complete Profile',
        read: false
      },
      {
        recipient: student._id,
        recipientModel: 'Student',
        senderModel: 'System',
        title: 'Complete Your KYC Verification',
        message: 'To access all features and apply for jobs, please complete your KYC verification. This helps ensure a secure and trusted platform.',
        type: 'warning',
        category: 'system',
        priority: 'normal',
        actionUrl: '/studentProfile?tab=verification',
        actionText: 'Verify Now',
        read: false
      },
      {
        recipient: student._id,
        recipientModel: 'Student',
        senderModel: 'System',
        title: 'New Job Opportunity Available',
        message: 'A new Software Developer position at TechCorp has been posted. This role matches your skills perfectly!',
        type: 'info',
        category: 'placement',
        priority: 'normal',
        actionUrl: '/jobs',
        actionText: 'View Job',
        read: true
      },
      {
        recipient: student._id,
        recipientModel: 'Student',
        senderModel: 'System',
        title: 'Portfolio Builder Feature',
        message: 'Discover our AI-powered portfolio builder to showcase your projects and skills effectively.',
        type: 'info',
        category: 'system',
        priority: 'normal',
        actionUrl: '/portfolio',
        actionText: 'Build Portfolio',
        read: false
      },
      {
        recipient: student._id,
        recipientModel: 'Student',
        senderModel: 'System',
        title: 'Interview Scheduled',
        message: 'Your interview with Google has been scheduled for tomorrow at 2:00 PM. Please prepare well!',
        type: 'success',
        category: 'placement',
        priority: 'high',
        actionUrl: '/interviews',
        actionText: 'View Details',
        read: false
      },
      {
        recipient: student._id,
        recipientModel: 'Student',
        senderModel: 'System',
        title: 'Profile Completion Reminder',
        message: 'Your profile is 75% complete. Adding more details increases your chances of getting hired!',
        type: 'warning',
        category: 'general',
        priority: 'normal',
        actionUrl: '/studentProfile',
        actionText: 'Complete Profile',
        read: false
      },
      {
        recipient: student._id,
        recipientModel: 'Student',
        senderModel: 'System',
        title: 'Achievement Unlocked',
        message: 'Congratulations! You\'ve completed your first job application. Keep up the great work!',
        type: 'success',
        category: 'general',
        priority: 'normal',
        actionUrl: null,
        actionText: null,
        read: true
      },
      {
        recipient: student._id,
        recipientModel: 'Student',
        senderModel: 'System',
        title: 'System Maintenance Notice',
        message: 'We\'ll be performing system maintenance on Sunday from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.',
        type: 'info',
        category: 'announcement',
        priority: 'low',
        actionUrl: null,
        actionText: null,
        read: false
      }
    ];

    // Insert notifications
    const createdNotifications = await Notification.insertMany(testNotifications);
    
    console.log(`✅ Successfully created ${createdNotifications.length} test notifications for ${student.name}`);
    console.log('\nCreated notifications:');
    createdNotifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title} (${notification.type}, ${notification.read ? 'Read' : 'Unread'})`);
    });

    console.log('\n🎯 You can now test:');
    console.log('- Mark as read functionality');
    console.log('- Delete individual notifications');
    console.log('- Clear all notifications');
    console.log('- Notification filtering and sorting');

  } catch (error) {
    console.error('Error creating test notifications:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the script
createTestNotifications(); 