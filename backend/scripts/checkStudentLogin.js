const mongoose = require('mongoose');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkStudentLogin = async () => {
  try {
    console.log('Connecting to database...');
    
    // Find ALL students with this email (in case there are duplicates)
    const students = await Student.find({ email: 'kishorirai02@gmail.com' });
    
    console.log(`Found ${students.length} students with email kishorirai02@gmail.com:`);
    
    students.forEach((student, index) => {
      console.log(`\nStudent ${index + 1}:`);
      console.log(`- _id: ${student._id}`);
      console.log(`- name: ${student.name}`);
      console.log(`- email: ${student.email}`);
      console.log(`- createdAt: ${student.createdAt}`);
      
      // Check notifications for this specific student
      Notification.find({
        recipient: student._id,
        recipientModel: 'Student'
      }).then(notifications => {
        console.log(`- notifications: ${notifications.length}`);
      });
    });

    // Also check all students to see if there are any with similar emails
    console.log('\n=== All students in database ===');
    const allStudents = await Student.find({}).select('_id name email createdAt').limit(10);
    allStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email}) - ${student._id}`);
    });

    // Check all notifications to see which students have notifications
    console.log('\n=== All notifications by recipient ===');
    const allNotifications = await Notification.find({}).select('recipient recipientModel title');
    const notificationsByRecipient = {};
    
    allNotifications.forEach(notification => {
      const key = `${notification.recipientModel}:${notification.recipient}`;
      if (!notificationsByRecipient[key]) {
        notificationsByRecipient[key] = [];
      }
      notificationsByRecipient[key].push(notification.title);
    });

    Object.entries(notificationsByRecipient).forEach(([key, titles]) => {
      console.log(`${key}: ${titles.length} notifications`);
      titles.slice(0, 3).forEach(title => console.log(`  - ${title}`));
    });

  } catch (error) {
    console.error('Error checking student login:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the script
checkStudentLogin(); 