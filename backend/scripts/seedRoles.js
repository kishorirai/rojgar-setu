require('dotenv').config({path:'../.env'});
const Role = require('../models/Role');
const mongoose = require('mongoose');
const Company = require('../models/Company');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const roles = [
  {
    companyKey: 'airtel',
    jobTitle: 'Machine Learning Engineer',
    numberOfStudents: 2,
    stipend: 35000,
    jobType: 'internship',
    location: 'Gurgaon, India',
    duration: '6 months',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Analysis'],
    description: 'Work on Airtel\'s AI/ML initiatives. Develop and implement machine learning models for various business applications.',
    requirements: [
      'Strong background in machine learning and statistics',
      'Experience with Python and ML frameworks',
      'Knowledge of deep learning algorithms',
      'Good analytical and problem-solving skills'
    ],
    applied: 0,
    status: 'active'
  },
  {
    companyKey: 'techori',
    jobTitle: 'Full Stack Developer',
    numberOfStudents: 2,
    stipend: 30000,
    jobType: 'internship',
    location: 'Chennai, India',
    duration: '6 months',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Git'],
    description: 'Join Techori\'s development team to build scalable web applications. Work on both frontend and backend development.',
    requirements: [
      'Strong knowledge of JavaScript/TypeScript',
      'Experience with React.js and Node.js',
      'Understanding of MongoDB and Express',
      'Good problem-solving and communication skills'
    ],
    applied: 0,
    status: 'active'
  },
  {
    companyKey: 'techori',
    jobTitle: 'UI/UX Designer',
    numberOfStudents: 1,
    stipend: 25000,
    jobType: 'internship',
    location: 'Chennai, India',
    duration: '6 months',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'UI Design'],
    description: 'Design user experiences and interfaces for Techori\'s web and mobile applications. Conduct user research and usability testing.',
    requirements: [
      'Experience with Figma or Adobe XD',
      'Strong portfolio of design projects',
      'Understanding of user-centered design principles',
      'Good communication and collaboration skills'
    ],
    applied: 0,
    status: 'active'
  },
  {
    companyKey: 'airtel',
    jobTitle: 'Web Development Intern',
    numberOfStudents: 3,
    stipend: 25000,
    jobType: 'internship',
    location: 'Gurgaon, India',
    duration: '6 months',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
    description: 'Join Airtel\'s digital team to work on customer-facing web applications. You will be involved in full-stack development using modern technologies.',
    requirements: [
      'Strong knowledge of JavaScript/TypeScript',
      'Understanding of React.js and Node.js',
      'Basic knowledge of databases',
      'Good problem-solving skills'
    ],
    applied: 0,
    status: 'active'
  }
];

const updateRoles = async () => {
  try {
    // Clear existing roles
    await Role.deleteMany({});
    console.log('Cleared existing roles');
    
    // Get company IDs
    const airtel = await Company.findOne({ name: /airtel/i });
    const techori = await Company.findOne({ name: /techori/i });

    if (!airtel || !techori) {
      throw new Error('Companies not found in database');
    }

    // Add company IDs to roles

    const updatedRoles = roles.map(role => {
      let companyId;
      if (role.companyKey === 'airtel') companyId = airtel._id;
      else if (role.companyKey === 'techori') companyId = techori._id;
      else throw new Error('Unknown companyKey');
      const { companyKey, ...rest } = role;
      return { ...rest, companyId };
    });
    
    // Insert new roles
    const createdRoles = await Role.insertMany(updatedRoles);
    console.log('Roles updated successfully:', createdRoles.length);
    
    // Log the created roles
    console.log('\nCreated roles:');
    createdRoles.forEach(role => {
      const companyName = role.companyId.toString() === airtel._id.toString() ? 'Airtel' : 'Techori';
      console.log(`- ${role.jobTitle} (${companyName})`);
      console.log(`  Location: ${role.location}`);
      console.log(`  Type: ${role.jobType}`);
      console.log(`  Stipend: ₹${role.stipend}`);
      console.log(`  Number of Students: ${role.numberOfStudents}`);
      console.log(`  RoleId: ${role._id}`);
      console.log(`  CompanyId: ${role.companyId}`);
      console.log('-------------------');
    });

  } catch (error) {
    console.error('Error updating roles:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the update
updateRoles(); 