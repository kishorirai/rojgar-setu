const mongoose = require('mongoose');
const Notification = require('../models/Notification');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const simpleTest = async () => {
  try {
    console.log('Testing notifications...');
    
    // Test 1: Count all notifications
    const totalCount = await Notification.countDocuments();
    console.log(`Total notifications in database: ${totalCount}`);
    
    // Test 2: Find notifications for the specific student
    const studentId = '684d86d139c6e61734ee395e';
    const studentNotifications = await Notification.find({
      recipient: studentId,
      recipientModel: 'Student'
    });
    
    console.log(`Notifications for student ${studentId}: ${studentNotifications.length}`);
    
    if (studentNotifications.length > 0) {
      console.log('Sample notification:');
      console.log(JSON.stringify(studentNotifications[0], null, 2));
    }
    
    // Test 3: Check if the studentId is a valid ObjectId
    console.log(`\nStudentId is valid ObjectId: ${mongoose.Types.ObjectId.isValid(studentId)}`);
    
    // Test 4: Try with ObjectId conversion
    const objectId = new mongoose.Types.ObjectId(studentId);
    const notificationsWithObjectId = await Notification.find({
      recipient: objectId,
      recipientModel: 'Student'
    });
    
    console.log(`Notifications with ObjectId conversion: ${notificationsWithObjectId.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

simpleTest(); 