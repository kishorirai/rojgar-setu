const mongoose = require('mongoose');
const { createStudentNotification, createCollegeNotification, createCompanyNotification } = require('../utils/notificationHelper');
const Student = require('../models/Student');
const College = require('../models/College');
const Company = require('../models/Company');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusadmin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createInitialNotifications() {
  try {
    console.log('Creating initial notifications...');

    // Get some sample users
    const students = await Student.find().limit(5);
    const colleges = await College.find().limit(3);
    const companies = await Company.find().limit(3);

    // Create welcome notifications for students
    for (const student of students) {
      await createStudentNotification(
        student._id,
        'Welcome to Campus Admin!',
        'Welcome to your dashboard! Complete your profile to get more opportunities.',
        {
          type: 'success',
          category: 'general',
          actionUrl: '/studentProfile',
          actionText: 'Complete Profile'
        }
      );

      // Add a KYC reminder if not verified
      if (student.kycStatus !== 'approved' && student.kycStatus !== 'verified') {
        await createStudentNotification(
          student._id,
          'KYC Verification Required',
          'Please complete your KYC verification to access all features.',
          {
            type: 'warning',
            category: 'system',
            actionUrl: '/studentProfile?tab=verification',
            actionText: 'Verify Now'
          }
        );
      }
    }

    // Create welcome notifications for colleges
    for (const college of colleges) {
      await createCollegeNotification(
        college._id,
        'Welcome to Campus Admin!',
        'Your college dashboard is ready. Start managing your students and placements.',
        {
          type: 'success',
          category: 'general',
          actionUrl: '/college-dashboard',
          actionText: 'View Dashboard'
        }
      );
    }

    // Create welcome notifications for companies
    for (const company of companies) {
      await createCompanyNotification(
        company._id,
        'Welcome to Campus Admin!',
        'Start posting jobs and finding talented students for your organization.',
        {
          type: 'success',
          category: 'general',
          actionUrl: '/company-dashboard',
          actionText: 'Post Jobs'
        }
      );
    }

    // Create some system notifications
    const allStudents = await Student.find();
    for (const student of allStudents) {
      await createStudentNotification(
        student._id,
        'New Features Available',
        'Check out our new AI-powered portfolio builder and enhanced job matching!',
        {
          type: 'info',
          category: 'system',
          actionUrl: '/portfolio',
          actionText: 'Try AI Portfolio'
        }
      );
    }

    console.log('Initial notifications created successfully!');
    console.log(`Created notifications for ${students.length} students, ${colleges.length} colleges, and ${companies.length} companies`);

  } catch (error) {
    console.error('Error creating initial notifications:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
if (require.main === module) {
  createInitialNotifications();
}

module.exports = createInitialNotifications; 