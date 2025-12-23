require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
const mongoose = require('mongoose');
const Student = require('../models/Student');
const College = require('../models/College');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=>{
    console.log('Connected to MongoDB')
}).catch((err)=>{
    console.log(err)
})

// Helper functions
const getRandomCGPA = () => (Math.random() * 4 + 6).toFixed(2);
const getRandomBatch = () => Math.floor(Math.random() * 5) + 2019;
const getRandomSkills = () => {
  const allSkills = ['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'MongoDB', 'SQL', 'Data Structures', 'Algorithms', 'Machine Learning', 'Cloud Computing', 'DevOps', 'UI/UX', 'Project Management'];
  return allSkills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 3);
};

const getRandomExtracurricular = () => {
  const activities = [
    { activity: 'Technical Club', role: 'Member', achievement: 'Organized coding workshop' },
    { activity: 'Sports', role: 'Team Captain', achievement: 'Inter-college tournament winner' },
    { activity: 'Cultural Club', role: 'Event Coordinator', achievement: 'Annual fest organizer' },
    { activity: 'Debate Club', role: 'Vice President', achievement: 'State level debate winner' },
    { activity: 'Robotics Club', role: 'Technical Lead', achievement: 'Project showcase winner' }
  ];
  return activities.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
};

const getRandomResearch = () => {
  const research = [
    { title: 'AI in Healthcare', role: 'Research Assistant', year: 2022, description: 'Machine learning applications in disease prediction' },
    { title: 'Blockchain Security', role: 'Team Member', year: 2023, description: 'Security analysis of blockchain networks' },
    { title: 'Quantum Computing', role: 'Research Intern', year: 2021, description: 'Quantum algorithms implementation' }
  ];
  return research.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
};

const getRandomHackathons = () => {
  const hackathons = [
    { name: 'HackMIT', year: 2023, achievement: 'First Place', description: 'AI-powered healthcare solution' },
    { name: 'CodeFest', year: 2022, achievement: 'Second Place', description: 'Blockchain-based voting system' },
    { name: 'InnovateX', year: 2021, achievement: 'Best Innovation', description: 'Smart city solution' }
  ];
  return hackathons.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
};

// Helper function to get graduation year based on batch
const getGraduationYear = (batch) => {
  const batchYear = parseInt(batch);
  return batchYear + 4; // Assuming 4-year course
};

// Generate students for a department
const generateStudentsForDepartment = async (collegeId, department) => {
  const students = [];
  const names = [
    'Arjun Sharma', 'Priya Patel', 'Rahul Gupta', 'Ananya Singh', 'Vikram Reddy',
    'Meera Joshi', 'Karthik Nair', 'Divya Iyer', 'Aditya Kumar', 'Sneha Desai'
  ];

  const college = await College.findOne({ code: collegeId });
  if (!college) {
    throw new Error(`College with code ${collegeId} not found`);
  }

  for (let i = 0; i < 5; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const uniqueId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const email = `${name.toLowerCase().replace(' ', '.')}.${department.code.toLowerCase()}.${uniqueId}@${collegeId === 'UM001' ? 'unom.ac.in' : 'mit.edu'}`;
    const rollNumber = `${collegeId}-${department.code}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const batch = getRandomBatch().toString();
    const joiningYear = parseInt(batch);
    const graduationYear = getGraduationYear(batch);

    // Generate a consistent ObjectId based on email to preserve references
    const objectId = new mongoose.Types.ObjectId();

    students.push({
      _id: objectId, // Preserve ObjectId for consistent references
      college: college._id,
      name,
      email,
      password: 'password123', // Add default password
      rollNumber,
      department: department.name,
      batch,
      joiningYear,
      graduationYear,
      cgpa: parseFloat(getRandomCGPA()),
      skills: getRandomSkills(),
      resume: `https://resumes.${collegeId === 'UM001' ? 'unom.ac.in' : 'mit.edu'}/${rollNumber}.pdf`,
      extracurricular: getRandomExtracurricular(),
      research: getRandomResearch(),
      hackathons: getRandomHackathons(),
      profileImage: `https://profile-images.${collegeId === 'UM001' ? 'unom.ac.in' : 'mit.edu'}/${rollNumber}.jpg`,
      isCollegeVerified: true,
      isSalesVerified: false,
      campusScore: 0
    });
  }

  return students;
};

// Main function to insert students
async function insertStudents() {
  try {
    await Student.deleteMany({});
    console.log('Cleared existing students');

    const colleges = await College.find({});
    let allStudents = [];

    for (const college of colleges) {
      for (const department of college.departments) {
        const students = await generateStudentsForDepartment(college.code, department);
        allStudents = [...allStudents, ...students];
      }
    }

    const insertedStudents = await Student.insertMany(allStudents);
    console.log(`Successfully inserted ${insertedStudents.length} students`);

    const departmentCounts = {};
    insertedStudents.forEach(student => {
      departmentCounts[student.department] = (departmentCounts[student.department] || 0) + 1;
    });

    console.log('\nDepartment-wise student count:');
    Object.entries(departmentCounts).forEach(([dept, count]) => {
      console.log(`${dept}: ${count} students`);
    });

  } catch (error) {
    console.error('Error inserting students:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the insertion
insertStudents(); 