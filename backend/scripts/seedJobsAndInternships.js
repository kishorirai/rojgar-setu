require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Internship = require('../models/Internship');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Interview = require('../models/Interview');

// Connect to MongoDB
const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log(err);
});

// Helper function to get a random date between two dates
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to get a random score between 0 and 10
const getRandomScore = () => {
  return Math.floor(Math.random() * 11);
};

// Helper function to get random skills
const getRandomSkills = () => {
  const skills = ['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'MongoDB', 'SQL', 'AWS', 'Docker'];
  const numSkills = Math.floor(Math.random() * 5) + 1;
  const selectedSkills = [];
  for (let i = 0; i < numSkills; i++) {
    const randomIndex = Math.floor(Math.random() * skills.length);
    selectedSkills.push(skills[randomIndex]);
  }
  return selectedSkills;
};

// Function to seed data
const seedData = async () => {
  try {
    // Clear existing data
    await Job.deleteMany({});
    await Internship.deleteMany({});
    await Interview.deleteMany({}); // Delete all existing interviews
    console.log('Cleared existing jobs, internships, and interviews');

    // Fetch students, companies, and interviews
    const students = await Student.find({});
    const companies = await Company.find({});
    const interviews = await Interview.find({}).populate('interviewee');

    console.log(`Found ${students.length} students`);
    console.log(`Found ${companies.length} companies`);
    console.log(`Found ${interviews.length} interviews`);

    // Create internships and jobs for students who have completed interviews
    const internships = [];
    const jobs = [];

    // First, create assignments for students with interviews
    for (const interview of interviews) {
      const student = interview.interviewee;
      const company = companies[Math.floor(Math.random() * companies.length)];
      const startDate = getRandomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));
      const endDate = getRandomDate(startDate, new Date(startDate.getFullYear(), startDate.getMonth() + 3, startDate.getDate()));

      // Create internship
      internships.push({
        studentId: student._id,
        companyId: company._id,
        interviewId: interview._id,
        title: `Internship at ${company.name}`,
        description: `Internship position at ${company.name}`,
        department: student.department,
        startDate,
        endDate,
        stipend: Math.floor(Math.random() * 50000) + 20000,
        mode: ['remote', 'onsite', 'hybrid'][Math.floor(Math.random() * 3)],
        status: 'offered',
        feedback: {
          technicalScore: getRandomScore(),
          communicationScore: getRandomScore(),
          problemSolvingScore: getRandomScore(),
          overallScore: getRandomScore(),
          comments: 'Great performance in the interview',
          date: new Date()
        }
      });

      // Create job
      jobs.push({
        studentId: student._id,
        companyId: company._id,
        interviewId: interview._id,
        title: `Job at ${company.name}`,
        description: `Job position at ${company.name}`,
        department: student.department,
        startDate,
        salary: Math.floor(Math.random() * 100000) + 50000,
        mode: ['remote', 'onsite', 'hybrid'][Math.floor(Math.random() * 3)],
        status: 'offered',
        feedback: {
          technicalScore: getRandomScore(),
          communicationScore: getRandomScore(),
          problemSolvingScore: getRandomScore(),
          overallScore: getRandomScore(),
          comments: 'Great performance in the interview',
          date: new Date()
        }
      });
    }

    // Then, create some direct hire assignments (without interviews)
    const studentsWithoutInterviews = students.filter(student => 
      !interviews.some(interview => interview.interviewee._id.toString() === student._id.toString())
    );

    // Create direct hire assignments for 20% of remaining students
    const numDirectHires = Math.ceil(studentsWithoutInterviews.length * 0.2);
    console.log(`Creating ${numDirectHires} direct hire assignments...`);
    
    const selectedStudents = studentsWithoutInterviews
      .sort(() => 0.5 - Math.random())
      .slice(0, numDirectHires);

    for (const student of selectedStudents) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const startDate = getRandomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));
      const endDate = getRandomDate(startDate, new Date(startDate.getFullYear(), startDate.getMonth() + 3, startDate.getDate()));

      // Create direct hire internship
      internships.push({
        studentId: student._id,
        companyId: company._id,
        title: `Direct Internship at ${company.name}`,
        description: `Direct internship offer at ${company.name}`,
        department: student.department,
        startDate,
        endDate,
        stipend: Math.floor(Math.random() * 50000) + 20000,
        mode: ['remote', 'onsite', 'hybrid'][Math.floor(Math.random() * 3)],
        status: 'offered',
        feedback: {
          technicalScore: getRandomScore(),
          communicationScore: getRandomScore(),
          problemSolvingScore: getRandomScore(),
          overallScore: getRandomScore(),
          comments: 'Direct hire based on profile and achievements',
          date: new Date()
        }
      });

      // Create direct hire job
      jobs.push({
        studentId: student._id,
        companyId: company._id,
        title: `Direct Job at ${company.name}`,
        description: `Direct job offer at ${company.name}`,
        department: student.department,
        startDate,
        salary: Math.floor(Math.random() * 100000) + 50000,
        mode: ['remote', 'onsite', 'hybrid'][Math.floor(Math.random() * 3)],
        status: 'offered',
        feedback: {
          technicalScore: getRandomScore(),
          communicationScore: getRandomScore(),
          problemSolvingScore: getRandomScore(),
          overallScore: getRandomScore(),
          comments: 'Direct hire based on profile and achievements',
          date: new Date()
        }
      });
    }

    console.log('Inserting internships and jobs...');
    // Insert internships and jobs in batches
    const batchSize = 50;
    for (let i = 0; i < internships.length; i += batchSize) {
      const internshipBatch = internships.slice(i, i + batchSize);
      const jobBatch = jobs.slice(i, i + batchSize);
      await Internship.insertMany(internshipBatch);
      await Job.insertMany(jobBatch);
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(internships.length/batchSize)}`);
    }

    // Verify the insertions
    const insertedInternships = await Internship.countDocuments();
    const insertedJobs = await Job.countDocuments();
    const insertedInterviews = await Interview.countDocuments();

    console.log('\nSeeding Summary:');
    console.log('----------------');
    console.log(`Total Students: ${students.length}`);
    console.log(`Total Companies: ${companies.length}`);
    console.log(`Total Interviews: ${insertedInterviews}`);
    console.log(`Total Internships: ${insertedInternships}`);
    console.log(`Total Jobs: ${insertedJobs}`);
    console.log('----------------');

    console.log('Data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
};

seedData(); 