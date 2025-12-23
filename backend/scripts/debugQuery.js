const mongoose = require('mongoose');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const debugQuery = async () => {
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

    const userId = student._id;

    // Test 1: Simple query without any filters
    console.log('\n=== Test 1: Simple query ===');
    const simpleQuery = await Notification.find({
      recipient: userId,
      recipientModel: 'Student'
    });
    console.log(`Simple query result: ${simpleQuery.length} notifications`);

    // Test 2: Query with expiresAt filter (like dashboard controller)
    console.log('\n=== Test 2: With expiresAt filter ===');
    const expiresQuery = await Notification.find({
      recipient: userId,
      recipientModel: 'Student',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });
    console.log(`Expires filter query result: ${expiresQuery.length} notifications`);

    // Test 3: Check if notifications have expiresAt field
    console.log('\n=== Test 3: Check expiresAt fields ===');
    const allNotifications = await Notification.find({
      recipient: userId,
      recipientModel: 'Student'
    });
    
    allNotifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title}`);
      console.log(`   - expiresAt: ${notification.expiresAt}`);
      console.log(`   - expiresAt exists: ${notification.expiresAt !== undefined}`);
      console.log(`   - createdAt: ${notification.createdAt}`);
      console.log('   ---');
    });

    // Test 4: Check if there are any notifications with expiresAt
    console.log('\n=== Test 4: Check for expired notifications ===');
    const expiredNotifications = await Notification.find({
      recipient: userId,
      recipientModel: 'Student',
      expiresAt: { $exists: true, $lte: new Date() }
    });
    console.log(`Expired notifications: ${expiredNotifications.length}`);

    // Test 5: Check all notifications in the database for this student
    console.log('\n=== Test 5: All notifications for student ===');
    const allForStudent = await Notification.find({
      recipient: userId,
      recipientModel: 'Student'
    }).lean();
    
    console.log(`Total notifications for student: ${allForStudent.length}`);
    allForStudent.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title}`);
      console.log(`   - _id: ${notification._id}`);
      console.log(`   - recipient: ${notification.recipient}`);
      console.log(`   - recipientModel: ${notification.recipientModel}`);
      console.log(`   - expiresAt: ${notification.expiresAt}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('Error debugging query:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the script
debugQuery(); 