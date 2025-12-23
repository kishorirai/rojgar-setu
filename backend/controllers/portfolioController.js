const Student = require('../models/Student');
const {verifyToken} = require('../middleware/auth'); // Assuming you have a utility function to verify JWT

// Generate AI Portfolio
exports.generatePortfolio = async (req, res) => {
  try {
    // Get user ID from session
    if (!req.cookies.token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated. Please log in.' 
      });
    }

    const decoded = verifyToken(req.cookies.token);
    const studentId = decoded.id;
    
    // Fetch student data
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student profile not found' 
      });
    }

    // Create portfolio data structure
    const portfolio = {
      personalInfo: {
        name: student.name,
        email: student.email,
        phone: student.phone,
        location: student.location,
        title: student.title || 'Student',
        careerObjective: student.careerObjective,
        portfolioUrl: student.portfolioUrl,
        githubUrl: student.githubUrl,
        linkedinUrl: student.linkedinUrl
      },
      education: {
        college: student.college,
        degree: student.degree,
        major: student.major,
        year: student.year,
        gpa: student.gpa,
        cgpa: student.cgpa,
        expectedGraduation: student.expectedGraduation,
        department: student.department,
        batch: student.batch,
        joiningYear: student.joiningYear,
        graduationYear: student.graduationYear
      },
      skills: {
        skills: student.skills || [],
        programmingLanguages: student.programmingLanguages || [],
        technologies: student.technologies || []
      },
      projects: student.projects || [],
      achievements: student.achievements || [],
      certifications: student.certifications || [],
      extracurricular: student.extracurricular || [],
      research: student.research || [],
      hackathons: student.hackathons || []
    };

    res.json({
      success: true,
      portfolio
    });
  } catch (err) {
    console.error('Portfolio generation error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate portfolio', 
      error: err.message 
    });
  }
};