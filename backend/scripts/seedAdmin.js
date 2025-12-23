require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB for admin seeding');
}).catch((err) => {
  console.log('Connection error:', err);
});

async function seedAdmin() {
  try {
    console.log('Starting admin seeding...');

    // Define all admin accounts to create (matching Employee Management component data)
    const adminAccounts = [
      {
        username: 'Raj Shivre',
        email: 'raj@email.com',
        password: 'raj123',
        role: 'admin',
        permissions: ['Dashboard', 'Analytics', 'User Management', 'Content Moderation', 'Support Panel', 'Employee Management', 'Platform Settings'],
        status: 'active',
        phone: '+91-9876543210',
        profileImage: ''
      },
      {
        username: 'Kishori',
        email: 'kishori@email.com',
        password: 'kishori123',
        role: 'admin',
        permissions: ['User Management','Employee Management','Content Moderation','Platform Settings'],
        status: 'active',
        phone: '+91-9876543211',
        profileImage: ''
      }

    ];

    // Define all employee accounts to create (matching Employee Management component data)
    const employeeAccounts = [
      {
        username: 'Harsh Raj',
        email: 'harshraj@email.com',
        password: 'harsh123',
        role: 'employee',
        permissions: ['User Management', 'Support Panel'],
        status: 'inactive',
        phone: '+91-9876543217',
        profileImage: ''
      },
      {
        username: 'Anmol Tiwari',
        email: 'anmol@email.com',
        password: 'anmol123',
        role: 'employee',
        permissions: ['Analytics', 'Content Moderation'],
        status: 'active',
        phone: '+91-9876543218',
        profileImage: ''
      },
      {
        username: 'Sumit Sahu',
        email: 'sumit@email.com',
        password: 'sumit123',
        role: 'employee',
        permissions: ['Support Panel'],
        status: 'active',
        phone: '+91-9876543219',
        profileImage: ''
      },
    ];

    // Clear existing admin accounts
    console.log('\n=== Clearing Existing Admin Accounts ===');
    await Admin.deleteMany({});
    console.log('✅ Cleared all existing admin accounts');

    // Create admin accounts
    console.log('\n=== Creating Admin Accounts ===');
    for (const account of adminAccounts) {
      const admin = new Admin(account);
      await admin.save();
      console.log(`✅ Admin created: ${account.email} (${account.username})`);
    }

    // Create employee accounts
    console.log('\n=== Creating Employee Accounts ===');
    for (const account of employeeAccounts) {
      const employee = new Admin(account);
      await employee.save();
      console.log(`✅ Employee created: ${account.email} (${account.username})`);
    }

    console.log('\n=== All Accounts Summary ===');
    console.log('\n📋 Admin Accounts:');
    adminAccounts.forEach(account => {
      console.log(`   • ${account.email} / ${account.password} - ${account.username} (${account.status})`);
    });
    
    console.log('\n👥 Employee Accounts:');
    employeeAccounts.forEach(account => {
      console.log(`   • ${account.email} / ${account.password} - ${account.username} (${account.status})`);
    });

    console.log('\n🎯 Employee Management Data Matches:');
    console.log('   • Raj Shivre (admin) - Full permissions, Active');
    console.log('   • Harsh Raj (employee) - User Management, Support Panel, Inactive');
    console.log('   • Anmol Tiwari (employee) - Analytics, Content Moderation, Active');
    console.log('   • Kishori (admin) - User Management, Employee Management, Content Moderation, Platform Settings, Active');
    console.log('   • Sumit Sahu (employee) - Support Panel, Active');

  } catch (error) {
    console.error('Error seeding admin accounts:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the seeding
seedAdmin(); 