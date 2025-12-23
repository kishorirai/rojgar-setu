const mongoose = require('mongoose');
const College = require('../models/College');
require('dotenv').config({path: "../.env"});

// MongoDB connection string - update with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusadmin';

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Fetch and display all colleges
async function fetchAllColleges() {
  try {
    console.log('\n🔍 Fetching all colleges from database...\n');
    
    // Fetch all colleges, excluding password field
    const colleges = await College.find({}, { password: 0 }).sort({ name: 1 });
    
    if (colleges.length === 0) {
      console.log('📭 No colleges found in the database.');
      return;
    }
    
    console.log(`📊 Found ${colleges.length} college(s) in the database:\n`);
    console.log('='.repeat(120));
    
    colleges.forEach((college, index) => {
      console.log(`\n🏫 COLLEGE #${index + 1}`);
      console.log('-'.repeat(50));
      console.log(`📝 Name: ${college.name}`);
      console.log(`🏷️  Code: ${college.code}`);
      console.log(`📍 Location: ${college.location}`);
      console.log(`🌐 Website: ${college.website || 'Not specified'}`);
      console.log(`📧 Contact Email: ${college.contactEmail}`);
      console.log(`📞 Contact Phone: ${college.contactPhone}`);
      console.log(`📅 Established Year: ${college.establishedYear}`);
      console.log(`🏞️  Campus Size: ${college.campusSize} acres`);
      
      // Placement Officer Information
      if (college.placementOfficer) {
        console.log(`\n👤 Placement Officer:`);
        console.log(`   👨‍💼 Name: ${college.placementOfficer.name || 'Not specified'}`);
        console.log(`   📧 Email: ${college.placementOfficer.email || 'Not specified'}`);
        console.log(`   📱 Phone: ${college.placementOfficer.phone || 'Not specified'}`);
      }
      
      // Departments Information
      if (college.departments && college.departments.length > 0) {
        console.log(`\n🎓 Departments (${college.departments.length}):`);
        college.departments.forEach((dept, deptIndex) => {
          console.log(`   ${deptIndex + 1}. ${dept.name} (${dept.code})`);
        });
      } else {
        console.log(`\n🎓 Departments: No departments specified`);
      }
      
      console.log(`\n🆔 MongoDB ID: ${college._id}`);
      console.log(`📅 Created: ${college.createdAt ? new Date(college.createdAt).toLocaleString() : 'Not available'}`);
      console.log(`📅 Updated: ${college.updatedAt ? new Date(college.updatedAt).toLocaleString() : 'Not available'}`);
      
      console.log('\n' + '='.repeat(120));
    });
    
    // Summary statistics
    console.log('\n📈 SUMMARY STATISTICS:');
    console.log('-'.repeat(30));
    console.log(`Total Colleges: ${colleges.length}`);
    
    // Count colleges with websites
    const withWebsite = colleges.filter(c => c.website).length;
    console.log(`Colleges with Website: ${withWebsite}`);
    
    // Count colleges with placement officers
    const withPlacementOfficer = colleges.filter(c => c.placementOfficer && c.placementOfficer.name).length;
    console.log(`Colleges with Placement Officer: ${withPlacementOfficer}`);
    
    // Count total departments
    const totalDepartments = colleges.reduce((sum, c) => sum + (c.departments ? c.departments.length : 0), 0);
    console.log(`Total Departments: ${totalDepartments}`);
    
    // Average campus size
    const avgCampusSize = colleges.reduce((sum, c) => sum + (c.campusSize || 0), 0) / colleges.length;
    console.log(`Average Campus Size: ${avgCampusSize.toFixed(1)} acres`);
    
    // Oldest and newest colleges
    const years = colleges.map(c => c.establishedYear).filter(y => y).sort((a, b) => a - b);
    if (years.length > 0) {
      console.log(`Oldest College: ${years[0]}`);
      console.log(`Newest College: ${years[years.length - 1]}`);
    }
    
  } catch (error) {
    console.error('❌ Error fetching colleges:', error);
  }
}

// Search colleges by specific criteria
async function searchColleges(criteria) {
  try {
    console.log(`\n🔍 Searching colleges with criteria: ${JSON.stringify(criteria)}\n`);
    
    const colleges = await College.find(criteria, { password: 0 }).sort({ name: 1 });
    
    if (colleges.length === 0) {
      console.log('📭 No colleges found matching the criteria.');
      return;
    }
    
    console.log(`📊 Found ${colleges.length} college(s) matching the criteria:\n`);
    
    colleges.forEach((college, index) => {
      console.log(`${index + 1}. ${college.name} (${college.code}) - ${college.location}`);
    });
    
  } catch (error) {
    console.error('❌ Error searching colleges:', error);
  }
}

// Main function to run the script
async function main() {
  await connectToDatabase();
  
  // Fetch all colleges
  await fetchAllColleges();
  
  // Example searches (uncomment to use)
  // await searchColleges({ location: 'Mumbai' });
  // await searchColleges({ 'placementOfficer.name': { $exists: true } });
  // await searchColleges({ establishedYear: { $gte: 2000 } });
  
  // Close the connection
  await mongoose.connection.close();
  console.log('\n👋 Disconnected from MongoDB.');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  connectToDatabase,
  fetchAllColleges,
  searchColleges
};
