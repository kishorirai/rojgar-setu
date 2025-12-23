require('dotenv').config({path:'../.env'})
const mongoose = require('mongoose');
const Company = require('../models/Company');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const companies = [
  {
    name: 'Techori',
    type: 'Startup',
    industry: 'Technology',
    website: 'https://techorisolutions.com',
    location: 'Bangalore, Karnataka',
    contactEmail: 'careers@techorisolutions.com',
    password:"techori123",
    contactPhone: '+91 9876543210',
    hrContact: {
      name: 'Sarah Johnson',
      email: 'hr@techorisolutions.com',
      phone: '+91 9876543211',
      designation: 'HR Manager'
    },
    companySize: '51-200',
    foundedYear: 2020,
    description: 'Techori is a cutting-edge technology company specializing in AI and machine learning solutions. We focus on developing innovative software products and providing digital transformation services to businesses worldwide.',
    verificationStatus: 'verified',
    
  },
  {
    name: 'Airtel',
    type: 'MNC',
    industry: 'Telecommunications',
    website: 'https://www.airtel.in',
    location: 'New Delhi, India',
    contactEmail: 'careers@airtel.com',
    password:"airtel123",
    contactPhone: '+91 9876543220',
    hrContact: {
      name: 'Rajesh Kumar',
      email: 'hr@airtel.com',
      phone: '+91 9876543221',
      designation: 'Senior HR Manager'
    },
    companySize: '1000+',
    foundedYear: 1995,
    description: 'Bharti Airtel Limited is a leading global telecommunications company with operations in 18 countries across South Asia and Africa. The company ranks amongst the top 3 mobile service providers globally in terms of subscribers.',
    verificationStatus: 'verified',
    
  }
];

// Function to insert companies
async function insertCompanies() {
  try {
    // Clear existing companies
    await Company.deleteMany({});
    console.log('Cleared existing companies');

    // Insert new companies
    const insertedCompanies = await Company.insertMany(companies);
    console.log('Successfully inserted companies:');
    insertedCompanies.forEach(company => {
      console.log(`- ${company.name}`);
    });

  } catch (error) {
    console.error('Error inserting companies:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the insertion
insertCompanies(); 