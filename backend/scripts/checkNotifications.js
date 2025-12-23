const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkNotifications = async () => {
  try {
    console.log('Connecting to database...');
    
    // Find the student by email
    const student = await Student.findOne({ email: 'kishorirai02@gmail.com' });
    
    if (!student) {
      console.log('Student with email kishorirai02@gmail.com not found!');
      return;
    }

    console.log(`Found student: ${student.name} (${student.email})`);
    console.log(`Student ID: ${student._id}`);

    // Check notifications for this student
    const notifications = await Notification.find({
      recipient: student._id,
      recipientModel: 'Student'
    });

    console.log(`\nFound ${notifications.length} notifications for this student:`);
    
    if (notifications.length === 0) {
      console.log('No notifications found!');
    } else {
      notifications.forEach((notification, index) => {
        console.log(`${index + 1}. ${notification.title}`);
        console.log(`   - Recipient: ${notification.recipient}`);
        console.log(`   - RecipientModel: ${notification.recipientModel}`);
        console.log(`   - Read: ${notification.read}`);
        console.log(`   - Type: ${notification.type}`);
        console.log(`   - Category: ${notification.category}`);
        console.log('   ---');
      });
    }

    // Check all notifications in the database
    const allNotifications = await Notification.find({});
    console.log(`\nTotal notifications in database: ${allNotifications.length}`);
    
    if (allNotifications.length > 0) {
      console.log('Sample notifications:');
      allNotifications.slice(0, 3).forEach((notification, index) => {
        console.log(`${index + 1}. ${notification.title}`);
        console.log(`   - Recipient: ${notification.recipient}`);
        console.log(`   - RecipientModel: ${notification.recipientModel}`);
        console.log('   ---');
      });
    }

  } catch (error) {
    console.error('Error checking notifications:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the script
checkNotifications(); 