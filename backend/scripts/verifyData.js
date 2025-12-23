require('dotenv').config();
const mongoose = require('mongoose');

const Student = require('../models/Student');
const College = require('../models/College');
const Company = require('../models/Company');
const Employee = require('../models/Employee');

const verifyData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_connect');
    console.log('Connected to MongoDB');

    console.log(`Colleges: ${await College.countDocuments()}`);
    console.log(`Companies: ${await Company.countDocuments()}`);
    console.log(`Employees: ${await Employee.countDocuments()}`);
    console.log(`Students: ${await Student.countDocuments()}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
};

verifyData(); 