const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const XLSX = require('xlsx');
const { emailTransport } = require('../config/email');
const bcrypt = require('bcrypt');


// Import your models
const Student = require('../models/Student');
const Job = require('../models/Job');
const Internship = require('../models/Internship');
const Interview = require('../models/Interview');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const College = require('../models/College');

//app.get('/api/students/college/:collegeId') .....
//app.post('/api/students/bulk') .....
//app.get('/api/students/:id') .....
//app.post('/api/students/verify') .....

// Multer setup (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Header mapping from human-readable to camelCase
const headerMapping = {
  'Full Name': 'name',
  'Email Address': 'email',
  'Roll Number': 'rollNumber',
  'Department': 'department',
  'Joining Year': 'joiningYear',
  'Graduation Year': 'graduationYear',
  'CGPA': 'cgpa',
  'Password': 'password'
};

function cleanRow(row) {
  const cleaned = {};
  Object.keys(row).forEach(key => {
    const trimmedKey = key.trim();
    let value = row[key];
    if (typeof value === 'string') value = value.trim();
    
    // Convert human-readable header to camelCase
    const camelCaseKey = headerMapping[trimmedKey] || trimmedKey;
    cleaned[camelCaseKey] = value;
  });
  return cleaned;
}

router.get('/college/:collegeId', async (req, res) => {
  try {
    const students = await Student.find({ college: req.params.collegeId });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: err.message });
  }
});
router.post('/bulk', async (req, res) => {
  try {
    const students = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Invalid request: students must be a non-empty array' });
    }

    // Validate each student object
    for (const student of students) {
      if (!student.name || !student.email || !student.rollNumber || !student.department || !student.joiningYear || !student.graduationYear || !student.cgpa || !student.password) {
        return res.status(400).json({ 
          error: 'Missing required fields for student',
          student: student
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(student.email)) {
        return res.status(400).json({ 
          error: 'Invalid email format',
          student: student
        });
      }

      // Validate CGPA range
      if (student.cgpa < 0 || student.cgpa > 10) {
        return res.status(400).json({ 
          error: 'CGPA must be between 0 and 10',
          student: student
        });
      }
    }

    // Get emails and roll numbers for checking
    const emails = students.map(s => s.email);
    const rollNumbers = students.map(s => s.rollNumber);
    const collegeId = students[0]?.college;
    
    // Check if skip-duplicates is requested (for consistency with Excel upload)
    const skipDuplicates = req.query.query === 'skip-duplicates';
    
    // Check for existing students (both with and without college association)
    const existingStudents = await Student.find({
      $or: [
        { email: { $in: emails } },
        { rollNumber: { $in: rollNumbers } }
      ]
    });

    // Separate existing students by type
    const existingInThisCollege = existingStudents.filter(s => s.college && s.college.toString() === collegeId);
    const existingInOtherColleges = existingStudents.filter(s => s.college && s.college.toString() !== collegeId);
    const existingWithoutCollege = existingStudents.filter(s => !s.college);

    // Check for conflicts with students already associated with OTHER colleges
    if (existingInOtherColleges.length > 0 && !skipDuplicates) {
      const conflicts = existingInOtherColleges.map(s => ({
        email: s.email,
        rollNumber: s.rollNumber,
        reason: 'Already associated with another college'
      }));
      
      return res.status(409).json({ 
        error: 'Some students already exist and are associated with other colleges',
        existingStudents: conflicts
      });
    }

    // Process students for creation/update
    const studentsToCreate = [];
    const studentsToUpdate = [];
    const studentsToSkip = [];

    for (const student of students) {
      // First, check if student already exists in THIS college
      let existingStudent = existingInThisCollege.find(s => s.email === student.email);
      
      if (existingStudent) {
        // Student already exists in this college - skip or update
        studentsToSkip.push({
          studentId: existingStudent._id,
          email: existingStudent.email,
          rollNumber: existingStudent.rollNumber,
          reason: 'Already exists in this college'
        });
        continue;
      }
      
      // Check for self-registered students
      existingStudent = existingWithoutCollege.find(s => s.email === student.email);
      
      if (existingStudent) {
        // Update existing self-registered student
        studentsToUpdate.push({
          studentId: existingStudent._id,
          updateData: {
            college: collegeId,
            rollNumber: student.rollNumber,
            department: student.department,
            joiningYear: student.joiningYear,
            graduationYear: student.graduationYear,
            cgpa: student.cgpa,
            isCollegeVerified: true,
            campusScore: 6.5
          }
        });
      } else {
        // Check for roll number conflicts
        if (student.rollNumber && !skipDuplicates) {
          const rollNumberConflict = existingStudents.find(s => s.rollNumber === student.rollNumber);
          if (rollNumberConflict) {
            return res.status(409).json({ 
              error: 'Roll number already exists',
              existingStudents: [{
                email: rollNumberConflict.email,
                rollNumber: rollNumberConflict.rollNumber,
                reason: rollNumberConflict.college ? 'Roll number already associated with a college' : 'Roll number already exists'
              }]
            });
          }
        }
        
        // Create new student
        studentsToCreate.push(student);
      }
    }

    // Update existing students
    const updatedStudents = [];
    for (const updateInfo of studentsToUpdate) {
      const updatedStudent = await Student.findByIdAndUpdate(
        updateInfo.studentId,
        updateInfo.updateData,
        { new: true }
      );
      updatedStudents.push(updatedStudent);
    }

    // Create new students
    const createdStudents = studentsToCreate.length > 0 ? await Student.insertMany(studentsToCreate) : [];
    
    // Combine all processed students
    const allProcessedStudents = [...updatedStudents, ...createdStudents];
    
    // Get college name for email notifications
    let collegeName = 'Your College';
    try {
      if (collegeId) {
        const college = await College.findById(collegeId);
        if (college && college.name) {
          collegeName = college.name;
        }
      }
    } catch (error) {
      console.error('Error fetching college name for emails:', error);
    }

    // Send login credentials email to all processed students
    const emailPromises = allProcessedStudents.map(student => 
      sendLoginCredentialsEmail(student, collegeName)
    );
    
    // Send emails asynchronously (don't wait for completion)
    Promise.allSettled(emailPromises).then(results => {
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      //console.log(`Bulk email notifications: ${successful} sent successfully, ${failed} failed`);
    });

    // Prepare response message
    let responseMessage = '';
    const parts = [];
    
    if (studentsToSkip.length > 0) {
      parts.push(`${studentsToSkip.length} existing students were skipped (already in this college)`);
    }
    
    if (studentsToUpdate.length > 0) {
      parts.push(`${studentsToUpdate.length} self-registered students were updated`);
    }
    
    if (studentsToCreate.length > 0) {
      parts.push(`${studentsToCreate.length} new students were added`);
    }
    
    if (parts.length > 0) {
      responseMessage = `${parts.join(', ')}. Login credentials have been sent to all processed students via email.`;
    } else {
      responseMessage = 'No new students to process. All students already exist in this college.';
    }

    res.status(201).json({
      message: responseMessage,
      students: allProcessedStudents,
      summary: {
        updated: studentsToUpdate.length,
        created: studentsToCreate.length,
        total: allProcessedStudents.length
      }
    });
  } catch (err) {
    console.error('Error creating students:', err);
    res.status(500).json({ error: err.message });
  }
});
router.get('/:id', async (req, res) => {
  try {
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    const student = await Student.findById(req.params.id)
      .select('-password')
      .populate('department', 'name')
      .populate('batch', 'name')
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }


    // Fetch jobs
    const jobs = await Job.find({ studentId: req.params.id })
      .sort({ startDate: -1 })
      .lean();

    // Fetch internships
    const internships = await Internship.find({ studentId: req.params.id })
      .sort({ startDate: -1 })
      .lean();

    // Fetch interviews
    const interviews = await Interview.find({ interviewee: req.params.id })
      .populate('companyId', 'name')
      .sort({ date: -1 })
      .lean();

    // Fetch reviews
    const reviews = await Review.find({ studentId: req.params.id })
      .populate('reviewer', 'name')
      .sort({ date: -1 })
      .lean();

    // Combine all data
    const studentDetails = {
      ...student,
      jobs,
      internships,
      interviews,
      reviews
    };

    res.json(studentDetails);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ 
      message: 'Error fetching student details',
      error: error.message 
    });
  }
});

router.patch('/verify', async (req, res) => {
  try {
    const { studentId } = req.body;
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }
    // Find and update the student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { isCollegeVerified: true },
      { new: true, runValidators: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    // Fetch college info for notification
    const collegeId = updatedStudent.college;
    let collegeName = 'the college';
    if (collegeId) {
      const college = await College.findById(collegeId);
      if (college && college.name) collegeName = college.name;
    }
    // Create notification
    await Notification.create({
      sender: collegeId,
      senderModel: 'College',
      recipient: updatedStudent._id,
      recipientModel: 'Student',
      title: 'Student Verified',
      message: `Your profile has been verified by ${collegeName}. You can now apply for jobs and internships.`,
      type: 'success',
      category: 'academic',
      priority: 'normal'
    });
    res.json({ 
      message: 'Student verified successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error verifying student:', error);
    res.status(500).json({ 
      message: 'Error verifying student',
      error: error.message 
    });
  }
});

// POST /api/students/excel-sheet
router.post('/excel-sheet', upload.single('file'), async (req, res) => {
  try {
    const { collegeId } = req.body;
    if (!collegeId) {
      return res.status(400).json({ error: 'collegeId is required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse Excel file from buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });  
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet); 

    // Clean and map students
    const students = data.map(row => {
      const cleaned = cleanRow(row);
      return {
        ...cleaned,
        college: collegeId,
        campusScore: 6.5,
        isCollegeVerified: true,
        isSalesVerified: false
      };
    });

    // Validate each student object
    for (const student of students) {
      if (!student.name || !student.email || !student.rollNumber || !student.department || !student.joiningYear || !student.graduationYear || !student.cgpa || !student.password) {
        return res.status(400).json({ 
          error: 'Missing required fields for student',
          student: student
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(student.email)) {
        return res.status(400).json({ 
          error: 'Invalid email format',
          student: student
        });
      }

      // Validate CGPA range
      if (student.cgpa < 0 || student.cgpa > 10) {
        return res.status(400).json({ 
          error: 'CGPA must be between 0 and 10',
          student: student
        });
      }
    }

    const skipDuplicates = req.query.query === 'skip-duplicates';
    
    // Check for existing students (both with and without college association)
    const emails = students.map(s => s.email);
    const rollNumbers = students.map(s => s.rollNumber);
    const existingStudents = await Student.find({
      $or: [
        { email: { $in: emails } },
        { rollNumber: { $in: rollNumbers } }
      ]
    });

    // Separate existing students by type
    const existingInThisCollege = existingStudents.filter(s => s.college && s.college.toString() === collegeId);
    const existingInOtherColleges = existingStudents.filter(s => s.college && s.college.toString() !== collegeId);
    const existingWithoutCollege = existingStudents.filter(s => !s.college);

    // Check for conflicts with students already associated with OTHER colleges
    if (existingInOtherColleges.length > 0 && !skipDuplicates) {
      const conflicts = existingInOtherColleges.map(s => ({
        email: s.email,
        rollNumber: s.rollNumber,
        reason: 'Already associated with another college'
      }));
      
      return res.status(409).json({ 
        error: 'Some students already exist and are associated with other colleges',
        existingStudents: conflicts
      });
    }

    // Process students for creation/update
    const studentsToCreate = [];
    const studentsToUpdate = [];
    const studentsToSkip = [];

    for (const student of students) {
      // First, check if student already exists in THIS college
      let existingStudent = existingInThisCollege.find(s => s.email === student.email);
      
      if (existingStudent) {
        // Student already exists in this college - skip or update
        studentsToSkip.push({
          studentId: existingStudent._id,
          email: existingStudent.email,
          rollNumber: existingStudent.rollNumber,
          reason: 'Already exists in this college'
        });
        continue;
      }
      
      // Check for self-registered students
      existingStudent = existingWithoutCollege.find(s => s.email === student.email);
      
      if (existingStudent) {
        // Update existing self-registered student
        studentsToUpdate.push({
          studentId: existingStudent._id,
          updateData: {
            college: collegeId,
            rollNumber: student.rollNumber,
            department: student.department,
            joiningYear: student.joiningYear,
            graduationYear: student.graduationYear,
            cgpa: student.cgpa,
            isCollegeVerified: true,
            campusScore: 6.5
          }
        });
      } else {
        // Check for roll number conflicts
        if (student.rollNumber && !skipDuplicates) {
          const rollNumberConflict = existingStudents.find(s => s.rollNumber === student.rollNumber);
          if (rollNumberConflict) {
            return res.status(409).json({ 
              error: 'Roll number already exists',
              existingStudents: [{
                email: rollNumberConflict.email,
                rollNumber: rollNumberConflict.rollNumber,
                reason: rollNumberConflict.college ? 'Roll number already associated with a college' : 'Roll number already exists'
              }]
            });
          }
        }
        
        // Create new student
        studentsToCreate.push(student);
      }
    }

    // Update existing students
    const updatedStudents = [];
    for (const updateInfo of studentsToUpdate) {
      const updatedStudent = await Student.findByIdAndUpdate(
        updateInfo.studentId,
        updateInfo.updateData,
        { new: true }
      );
      updatedStudents.push(updatedStudent);
    }

    // Create new students
    const createdStudents = studentsToCreate.length > 0 ? await Student.insertMany(studentsToCreate) : [];
    
    // Combine all processed students
    const allProcessedStudents = [...updatedStudents, ...createdStudents];
    
    // Get college name for email notifications
    let collegeName = 'Your College';
    try {
      const college = await College.findById(collegeId);
      if (college && college.name) {
        collegeName = college.name;
      }
    } catch (error) {
      console.error('Error fetching college name for emails:', error);
    }

    // Send login credentials email to all processed students
    const emailPromises = allProcessedStudents.map(student => 
      sendLoginCredentialsEmail(student, collegeName)
    );
    
    // Send emails asynchronously (don't wait for completion)
    Promise.allSettled(emailPromises).then(results => {
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      //console.log(`Excel upload email notifications: ${successful} sent successfully, ${failed} failed`);
      //console.log(`Email notifications: ${successful} sent successfully, ${failed} failed`);
    });

    // Prepare response message
    let responseMessage = '';
    const parts = [];
    
    if (studentsToSkip.length > 0) {
      parts.push(`${studentsToSkip.length} existing students were skipped (already in this college)`);
    }
    
    if (studentsToUpdate.length > 0) {
      parts.push(`${studentsToUpdate.length} self-registered students were updated`);
    }
    
    if (studentsToCreate.length > 0) {
      parts.push(`${studentsToCreate.length} new students were added`);
    }
    
    if (parts.length > 0) {
      responseMessage = `${parts.join(', ')}. Login credentials have been sent to all processed students via email.`;
    } else {
      responseMessage = 'No new students to process. All students already exist in this college.';
    }

    res.status(201).json({
      message: responseMessage,
      students: allProcessedStudents,
      summary: {
        updated: studentsToUpdate.length,
        created: studentsToCreate.length,
        total: allProcessedStudents.length
      }
    });
  } catch (err) {
    console.error('Error uploading students from Excel:', err);
    res.status(500).json({ error: err.message });
  }
});




const sendLoginCredentialsEmail = async (student, collegeName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_SENDER || 'noreply@rojgarsetu.org',
      to: student.email,
      subject: `Welcome to ${collegeName} - Your Login Credentials`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to ${collegeName}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your student account has been created successfully!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Your Login Credentials</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #667eea; margin-top: 0;">Student Information</h3>
              <p><strong>Name:</strong> ${student.name}</p>
              <p><strong>Roll Number:</strong> ${student.rollNumber}</p>
              <p><strong>Department:</strong> ${student.department}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0;">Login Details</h3>
              <p><strong>Username (Email):</strong> ${student.email}</p>
              <p><strong>Password:</strong> ${student.password}</p>
            </div>
            
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
              <h3 style="color: #007bff; margin-top: 0;">Important Notes</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Please change your password after your first login for security</li>
                <li>Keep your login credentials safe and don't share them with others</li>
                <li>You can now access job opportunities, internships, and placement services</li>
                <li>Contact your college placement office if you need any assistance</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/student-login" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Login to Your Account
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This is an automated message from ${collegeName} placement portal.</p>
            <p>If you didn't expect this email, please contact your college administration.</p>
          </div>
        </div>
      `
    };

    await emailTransport.sendMail(mailOptions);
    //console.log(`Login credentials email sent to: ${student.email}`);
  } catch (error) {
    console.error(`Failed to send email to ${student.email}:`, error);
    // Don't throw error to prevent blocking the entire process
  }
};

module.exports = router;