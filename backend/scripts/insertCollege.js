require('dotenv').config({path:'../.env'})
const mongoose = require('mongoose');
const College = require('../models/College');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const colleges = [
  {
    name: 'University of Madras',
    code: 'UM001',
    location: 'Chennai, Tamil Nadu',
    website: 'https://www.unom.ac.in',
    contactEmail: 'placement@unom.ac.in',
    password:"unom123",
    contactPhone: '+91 4425380000',
    placementOfficer: {
      name: 'Dr. Ramesh Kumar',
      email: 'placement.officer@unom.ac.in',
      phone: '+91 4425380001'
    },
    departments: [
      {
        name: 'Computer Science',
        code: 'CS'
      },
      {
        name: 'Information Technology',
        code: 'IT'
      },
      {
        name: 'Electronics',
        code: 'EC'
      },
      {
        name: 'Mechanical Engineering',
        code: 'ME'
      },
      {
        name: 'Civil Engineering',
        code: 'CE'
      },
      {
        name: 'Electrical Engineering',
        code: 'EE'
      },
      {
        name: 'Chemical Engineering',
        code: 'CHE'
      },
      {
        name: 'Biotechnology',
        code: 'BT'
      },
      {
        name: 'Mathematics',
        code: 'MATH'
      },
      {
        name: 'Physics',
        code: 'PHY'
      },
      {
        name: 'Chemistry',
        code: 'CHEM'
      }
    ],
    establishedYear: 1857,
    campusSize: 250, // in acres
  },
  {
    name: 'Massachusetts Institute of Technology',
    code: 'MIT001',
    location: 'Cambridge, Massachusetts, USA',
    website: 'https://www.mit.edu',
    contactEmail: 'career-services@mit.edu',
    password:"mit123",
    contactPhone: '+1 6172531000',
    placementOfficer: {
      name: 'Dr. Sarah Anderson',
      email: 'career.services@mit.edu',
      phone: '+1 6172531001'
    },
    departments: [
      {
        name: 'Computer Science and Engineering',
        code: 'CSE'
      },
      {
        name: 'Electrical Engineering',
        code: 'EE'
      },
      {
        name: 'Mechanical Engineering',
        code: 'ME'
      },
      {
        name: 'Aeronautics and Astronautics',
        code: 'AA'
      },
      {
        name: 'Chemical Engineering',
        code: 'CHE'
      },
      {
        name: 'Civil and Environmental Engineering',
        code: 'CEE'
      },
      {
        name: 'Materials Science and Engineering',
        code: 'MSE'
      },
      {
        name: 'Nuclear Science and Engineering',
        code: 'NSE'
      },
      {
        name: 'Biological Engineering',
        code: 'BE'
      },
      {
        name: 'Mathematics',
        code: 'MATH'
      },
      {
        name: 'Physics',
        code: 'PHY'
      },
      {
        name: 'Chemistry',
        code: 'CHEM'
      }
    ],
    establishedYear: 1861,
    campusSize: 168, // in acres
  },
];

// Function to insert colleges
async function insertColleges() {
  try {
    // Clear existing colleges
    await College.deleteMany({});
    console.log('Cleared existing colleges');

    // Insert new colleges
    const insertedColleges = await College.insertMany(colleges);
    console.log('Successfully inserted colleges:');
    insertedColleges.forEach(college => {
      console.log(`- ${college.name}`);
    });

  } catch (error) {
    console.error('Error inserting colleges:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the insertion
insertColleges(); 