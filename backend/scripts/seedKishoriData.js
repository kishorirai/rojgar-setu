const mongoose = require('mongoose');
const Job = require('../models/Job');
const Internship = require('../models/Internship');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Interview = require('../models/Interview');
const Employee = require('../models/Employee');

// Connect to MongoDB
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_connect';
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

// Helper function to get a random score between 6 and 10 (realistic scores)
const getRandomScore = () => {
  return Math.floor(Math.random() * 5) + 6; // 6-10 range
};

// Helper function to get random comments
const getRandomComments = () => {
  const comments = [
    'Excellent technical skills and problem-solving abilities',
    'Great communication skills and team collaboration',
    'Strong analytical thinking and attention to detail',
    'Demonstrated leadership qualities and initiative',
    'Adaptable and quick learner with good work ethic',
    'Outstanding performance in technical assessments',
    'Shows great potential for growth and development',
    'Consistently delivers high-quality work',
    'Excellent time management and organizational skills',
    'Strong foundation in core concepts and technologies'
  ];
  return comments[Math.floor(Math.random() * comments.length)];
};

// Function to seed data for Kishori
const seedKishoriData = async () => {
  try {
    // Find the specific student
    const student = await Student.findOne({ email: 'kishorirai02@gmail.com' });
    if (!student) {
      console.log('Student with email kishorirai02@gmail.com not found. Creating one...');
      // Create the student if not found
      const newStudent = new Student({
        name: 'Kishori Rai',
        email: 'kishorirai02@gmail.com',
        password: 'password123',
        department: 'Computer Science',
        batch: '2024',
        joiningYear: 2020,
        graduationYear: 2024,
        cgpa: 8.5,
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'Machine Learning'],
        programmingLanguages: ['JavaScript', 'Python', 'Java', 'C++'],
        technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Git', 'Docker'],
        projects: [
          {
            title: 'E-commerce Platform',
            description: 'Full-stack e-commerce application with React and Node.js',
            technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
            startDate: '2023-01-01',
            endDate: '2023-06-01',
            link: 'https://github.com/kishori/ecommerce'
          },
          {
            title: 'AI Chatbot',
            description: 'Machine learning chatbot using Python and TensorFlow',
            technologies: ['Python', 'TensorFlow', 'NLP', 'Flask'],
            startDate: '2023-07-01',
            endDate: '2023-12-01',
            link: 'https://github.com/kishori/chatbot'
          }
        ],
        achievements: [
          {
            title: 'Hackathon Winner',
            description: 'First place in college hackathon',
            date: '2023-03-15',
            issuer: 'College Tech Fest'
          }
        ],
        certifications: [
          {
            name: 'AWS Certified Developer',
            issuer: 'Amazon Web Services',
            date: '2023-05-20',
            link: 'https://aws.amazon.com/certification'
          }
        ],
        extracurricular: [
          {
            activity: 'Technical Lead',
            role: 'Lead Developer',
            achievement: 'Led team of 5 developers'
          }
        ],
        research: [
          {
            title: 'Machine Learning in Healthcare',
            role: 'Research Assistant',
            year: 2023,
            description: 'Applied ML algorithms for disease prediction'
          }
        ],
        hackathons: [
          {
            name: 'TechCrunch Disrupt',
            year: 2023,
            achievement: 'Runner-up',
            description: 'Built innovative healthcare solution'
          }
        ]
      });
      await newStudent.save();
      console.log('Created new student: Kishori Rai');
    }

    // Get companies and employees
    const companies = await Company.find();
    const employees = await Employee.find();

    if (companies.length === 0) {
      console.log('No companies found. Please run company seeding first.');
      process.exit(1);
    }

    if (employees.length === 0) {
      console.log('No employees found. Please run employee seeding first.');
      process.exit(1);
    }

    const kishori = await Student.findOne({ email: 'kishorirai02@gmail.com' });
    console.log(`Found student: ${kishori.name} (${kishori.email})`);

    // Clear existing data for this student
    await Interview.deleteMany({ interviewee: kishori._id });
    await Job.deleteMany({ studentId: kishori._id });
    await Internship.deleteMany({ studentId: kishori._id });
    console.log('Cleared existing data for Kishori');

    // Create interviews
    const interviews = [];
    const interviewTitles = [
      'Software Development Intern',
      'Machine Learning Intern', 
      'Full Stack Development Intern',
      'Software Engineer',
      'Full Stack Developer'
    ];

    for (let i = 0; i < 5; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const interviewer = employees[Math.floor(Math.random() * employees.length)];
      const interviewDate = getRandomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
      
      const interview = new Interview({
        companyId: company._id,
        interviewer: interviewer._id,
        interviewee: kishori._id,
        candidateName: kishori.name,
        campusScore: kishori.campusScore || 8.5,
        link: `https://meet.google.com/abc-defg-hij`,
        zoomMeetingId: `123456789${i}`,
        zoomPassword: `pass${i}`,
        isDone: true,
        date: interviewDate,
        feedback: {
          technicalScore: getRandomScore(),
          communicationScore: getRandomScore(),
          problemSolvingScore: getRandomScore(),
          overallScore: getRandomScore(),
          comments: getRandomComments(),
          date: interviewDate
        },
        role: interviewTitles[i],
        status: ['completed', 'selected', 'accepted'][Math.floor(Math.random() * 3)],
        interviewDate: interviewDate.toISOString().split('T')[0],
        interviewTime: `${10 + i}:00 AM`,
        notes: 'Keep a pen and paper with you. Be prepared for technical questions.'
      });

      await interview.save();
      interviews.push(interview);
      console.log(`Created interview ${i + 1}: ${interviewTitles[i]} at ${company.name}`);
    }

    // Create internships (using first 3 interviews)
    const internshipTitles = [
      'Software Development Intern',
      'Machine Learning Intern',
      'Full Stack Development Intern'
    ];

    for (let i = 0; i < 3; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const interview = interviews[i]; // Use corresponding interview
      const startDate = getRandomDate(new Date(2023, 5, 1), new Date(2024, 5, 1));
      const endDate = new Date(startDate.getTime() + (6 * 30 * 24 * 60 * 60 * 1000)); // 6 months

      const internship = new Internship({
        studentId: kishori._id,
        companyId: company._id,
        interviewId: interview._id,
        title: internshipTitles[i], // Same title as interview
        description: `${internshipTitles[i]} position at ${company.name}. Work on real-world projects and gain hands-on experience.`,
        department: kishori.department,
        startDate,
        endDate,
        stipend: Math.floor(Math.random() * 30000) + 20000, // 20k-50k
        mode: ['remote', 'onsite', 'hybrid'][Math.floor(Math.random() * 3)],
        status: ['offered', 'accepted', 'completed'][Math.floor(Math.random() * 3)],
        feedback: {
          technicalScore: getRandomScore(),
          communicationScore: getRandomScore(),
          problemSolvingScore: getRandomScore(),
          overallScore: getRandomScore(),
          comments: getRandomComments(),
          date: new Date()
        }
      });

      await internship.save();
      console.log(`Created internship ${i + 1}: ${internshipTitles[i]} at ${company.name}`);
    }

    // Create jobs (using last 2 interviews)
    const jobTitles = [
      'Software Engineer',
      'Full Stack Developer'
    ];

    for (let i = 0; i < 2; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const interview = interviews[i + 3]; // Use interviews 4 and 5
      const startDate = getRandomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));

      const job = new Job({
        studentId: kishori._id,
        companyId: company._id,
        interviewId: interview._id,
        title: jobTitles[i], // Same title as interview
        description: `${jobTitles[i]} position at ${company.name}. Full-time role with competitive salary and benefits.`,
        department: kishori.department,
        startDate,
        salary: Math.floor(Math.random() * 500000) + 300000, // 3L-8L
        mode: ['remote', 'onsite', 'hybrid'][Math.floor(Math.random() * 3)],
        status: ['offered', 'accepted'][Math.floor(Math.random() * 2)],
        feedback: {
          technicalScore: getRandomScore(),
          communicationScore: getRandomScore(),
          problemSolvingScore: getRandomScore(),
          overallScore: getRandomScore(),
          comments: getRandomComments(),
          date: new Date()
        }
      });

      await job.save();
      console.log(`Created job ${i + 1}: ${jobTitles[i]} at ${company.name}`);
    }

    // Verify the data
    const totalInterviews = await Interview.countDocuments({ interviewee: kishori._id });
    const totalInternships = await Internship.countDocuments({ studentId: kishori._id });
    const totalJobs = await Job.countDocuments({ studentId: kishori._id });

    console.log('\n=== Seeding Summary for Kishori ===');
    console.log('-----------------------------------');
    console.log(`Student: ${kishori.name} (${kishori.email})`);
    console.log(`Total Interviews: ${totalInterviews}`);
    console.log(`Total Internships: ${totalInternships}`);
    console.log(`Total Jobs: ${totalJobs}`);
    console.log('-----------------------------------');
    console.log('✓ Data seeded successfully for Kishori!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data for Kishori:', error);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
};

seedKishoriData(); 