require('dotenv').config({path:'../.env'})
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Employee = require('../models/Employee');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function insertEmployees() {
  try {
    // Fetch company IDs
    const techori = await Company.findOne({ name: 'Techori' });
    const airtel = await Company.findOne({ name: 'Airtel' });
    if (!techori || !airtel) {
      throw new Error('One or both companies not found in the database');
    }

    // Prepare employees
    const employees = [
      // Techori
      {
        name: 'Priya Sharma',
        email: 'employee@techorisolutions.com',
        password: 'techori123',
        type: 'employee',
        companyId: techori._id,
        phone: '+91 9000000001',
        department: 'Engineering',
        position: 'Software Engineer'
      },
      {
        name: 'Sarah Johnson',
        email: 'hr@techorisolutions.com',
        password: 'techori123',
        type: 'hr',
        companyId: techori._id,
        phone: '+91 9876543211',
        department: 'HR',
        position: 'HR Manager'
      },
      {
        name: 'Amit Verma',
        email: 'admin@techorisolutions.com',
        password: 'techori123',
        type: 'admin',
        companyId: techori._id,
        phone: '+91 9000000002',
        department: 'Management',
        position: 'Admin'
      },
      // Airtel
      {
        name: 'Rohit Singh',
        email: 'employee@airtel.com',
        password: 'airtel123',
        type: 'employee',
        companyId: airtel._id,
        phone: '+91 9000000011',
        department: 'Engineering',
        position: 'Network Engineer'
      },
      {
        name: 'Rajesh Kumar',
        email: 'hr@airtel.com',
        password: 'airtel123',
        type: 'hr',
        companyId: airtel._id,
        phone: '+91 9876543221',
        department: 'HR',
        position: 'Senior HR Manager'
      },
      {
        name: 'Sunita Mehra',
        email: 'admin@airtel.com',
        password: 'airtel123',
        type: 'admin',
        companyId: airtel._id,
        phone: '+91 9000000012',
        department: 'Management',
        position: 'Admin'
      }
    ];

    // Clear existing employees
    await Employee.deleteMany({});
    console.log('Cleared existing employees');

    // Insert new employees
    const inserted = await Employee.insertMany(employees);
    console.log('Inserted employees:');
    inserted.forEach(e => console.log(`- ${e.email}`));
  } catch (error) {
    console.error('Error inserting employees:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

insertEmployees(); 