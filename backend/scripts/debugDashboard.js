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

const debugDashboard = async () => {
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
    console.log(`Student ObjectId type: ${typeof student._id}`);
    console.log(`Student ObjectId string: ${student._id.toString()}`);

    // Simulate JWT token generation (like in authController)
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

    console.log(`\nGenerated JWT token: ${token}`);

    // Decode the token to see what's inside
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`\nDecoded JWT payload:`);
    console.log(`- id: ${decoded.id}`);
    console.log(`- id type: ${typeof decoded.id}`);
    console.log(`- name: ${decoded.name}`);
    console.log(`- email: ${decoded.email}`);
    console.log(`- type: ${decoded.type}`);

    // Check if the decoded ID matches the student ObjectId
    console.log(`\nID Comparison:`);
    console.log(`Student ObjectId: ${student._id}`);
    console.log(`JWT decoded ID: ${decoded.id}`);
    console.log(`Are they equal? ${student._id.toString() === decoded.id.toString()}`);

    // Now check notifications with the decoded ID
    const notifications = await Notification.find({
      recipient: decoded.id,
      recipientModel: 'Student'
    });

    console.log(`\nNotifications found with JWT decoded ID: ${notifications.length}`);

    // Also check with the student ObjectId directly
    const notificationsWithObjectId = await Notification.find({
      recipient: student._id,
      recipientModel: 'Student'
    });

    console.log(`Notifications found with student ObjectId: ${notificationsWithObjectId.length}`);

    if (notifications.length === 0 && notificationsWithObjectId.length > 0) {
      console.log('\n🚨 ISSUE FOUND: JWT ID does not match student ObjectId!');
      console.log('This is why notifications are not being fetched in the dashboard.');
    }

  } catch (error) {
    console.error('Error debugging dashboard:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the script
debugDashboard(); 