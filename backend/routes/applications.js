const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Application = require('../models/CollegeApplication');
const College = require('../models/College');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Role = require('../models/Role');
const Interview = require('../models/Interview');

const {emailTransport} = require('../config/email'); // You should move email config to separate file

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


// Application routes
// cretate new application
// Get applications for a college
// Get applications for a company
// Update student application status, company updates student status for interview, selected, rejected
// Update application status, updates to close when company closes application but remains in college applications list
// Delete application
// Accept student application
// Reject student application

// Create a new application
router.post('/', async (req, res) => {
  try {
    const { applicationFromCollege, applicationToCompany, roleId, roleName, students } = req.body;
    //console.log(req.body);
    
    if (!applicationFromCollege || !applicationToCompany || !roleId || !students || !Array.isArray(students)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const application = new Application({
      ...req.body
    });
    
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Error creating application' });
  }
});

// Get applications for a college
router.get('/college/:collegeId', async (req, res) => {
  try {
    const applications = await Application.find({ applicationFromCollege: req.params.collegeId })
      .populate('applicationToCompany', 'name')
      .populate('roleId', 'jobTitle')
      .populate('students.studentId', 'name email rollNumber cgpa batch skills')
      .sort({createdAt: -1});
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Get applications for a company
router.get('/company/:companyId', async (req, res) => {
  try {
    const applications = await Application.find({ 
      applicationToCompany: req.params.companyId, 
      status: "active" 
    })
      .populate('applicationFromCollege', 'name')
      .populate('roleId', 'jobTitle')
      .populate('students.studentId', 'name email rollNumber cgpa batch skills')
      .select('status applicationFromCollege applicationToCompany roleId students createdAt updatedAt');
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Update student application status
router.patch('/:applicationId/students/:studentId/status', async (req, res) => {
  try {
    const { applicationId, studentId } = req.params;
    const { status, interviewDate, interviewLink } = req.body;

    if (!['pending', 'accepted', 'rejected', 'interview-scheduled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const studentIndex = application.students.findIndex(s => s.id.toString() === studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found in application' });
    }

    application.students[studentIndex].status = status;
    if (status === 'interview-scheduled') {
      if (!interviewDate) {
        return res.status(400).json({ message: 'Interview date is required for interview-scheduled status' });
      }
      application.students[studentIndex].interviewDate = interviewDate;
      application.students[studentIndex].interviewLink = interviewLink;
    }

    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
});

// Update application status
router.patch('/:applicationId/status', async (req, res) => {
  try {
    //console.log("status: ",req.body);
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['active', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
});

router.patch('/:id', async (req,res)=>{
  try{
    const application = await Application.findByIdAndUpdate(req.params.id,{status: req.body.status});
    res.json(application);
  }catch(err){
    res.status(404).json({message:"Error Updating Status"});
    console.log(err);
  }
})
// Delete application
router.delete('/:applicationId', async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Error deleting application' });
  }
});

// Accept student application
router.post('/:applicationId/students/:studentId/accept', async (req, res) => {
  try {
    const { applicationId, studentId } = req.params;
    const { mailSubject, mailBody } = req.body;

    const application = await Application.findById(applicationId)
      .populate('students.studentId', 'name email')
      .populate('roleId', 'jobTitle')
      .populate('applicationToCompany', 'name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const studentIndex = application.students.findIndex(s => s.studentId._id.toString() === studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found in application' });
    }

    // Update student status
    application.students[studentIndex].status = 'accepted';
    await application.save();

    // Send email to student
    const student = application.students[studentIndex].studentId;
    await emailTransport.sendMail({
      to: student.email,
      subject: mailSubject,
      text: mailBody
    });

    res.json(application);
  } catch (error) {
    console.error('Error accepting student:', error);
    res.status(500).json({ message: 'Error accepting student' });
  }
});

// Reject student application
router.post('/:applicationId/students/:studentId/reject', async (req, res) => {
  try {
    const { applicationId, studentId } = req.params;
    const { mailSubject, mailBody } = req.body;

    const application = await Application.findById(applicationId)
      .populate('students.studentId', 'name email')
      .populate('roleId', 'jobTitle')
      .populate('applicationToCompany', 'name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const studentIndex = application.students.findIndex(s => s.studentId._id.toString() === studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found in application' });
    }

    // Update student status
    application.students[studentIndex].status = 'rejected';
    await application.save();

    // Send email to student
    const student = application.students[studentIndex].studentId;
    await emailTransport.sendMail({
      to: student.email,
      subject: mailSubject,
      text: mailBody
    });
    res.json(application);
  } catch (error) {
    console.error('Error rejecting student:', error);
    res.status(500).json({ message: 'Error rejecting student' });
  }
});

// Optimized endpoint for company applications with all related data
router.get('/company/:companyId/complete', async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!isValidObjectId(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }

    // Get company data
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get all applications with populated student data in a single query
    const applications = await Application.aggregate([
      { $match: { applicationToCompany: new mongoose.Types.ObjectId(companyId), status: 'active' } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'colleges',
          localField: 'applicationFromCollege',
          foreignField: '_id',
          as: 'collegeDetails'
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'students.studentId',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $lookup: {
          from: 'internships',
          localField: 'studentDetails._id',
          foreignField: 'studentId',
          as: 'internships'
        }
      },
      {
        $lookup: {
          from: 'interviews',
          localField: 'studentDetails._id',
          foreignField: 'interviewee',
          as: 'interviews'
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'studentDetails._id',
          foreignField: 'studentId',
          as: 'jobs'
        }
      },
      {
        $addFields: {
          collegeName: { $arrayElemAt: ['$collegeDetails.name', 0] },
          students: {
            $map: {
              input: '$students',
              as: 'student',
              in: {
                $mergeObjects: [
                  '$$student',
                  {
                    studentId: {
                      $let: {
                        vars: {
                          studentDetail: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$studentDetails',
                                  as: 'sd',
                                  cond: { $eq: ['$$sd._id', '$$student.studentId'] }
                                }
                              },
                              0
                            ]
                          }
                        },
                        in: {
                          $mergeObjects: [
                            '$$studentDetail',
                            {
                              internships: {
                                $filter: {
                                  input: '$internships',
                                  as: 'internship',
                                  cond: { $eq: ['$$internship.studentId', '$$student.studentId'] }
                                }
                              },
                              interview_scheduled: {
                                $filter: {
                                  input: '$interviews',
                                  as: 'interview',
                                  cond: { $eq: ['$$interview.interviewee', '$$student.studentId'] }
                                }
                              },
                              jobs: {
                                $filter: {
                                  input: '$jobs',
                                  as: 'job',
                                  cond: { $eq: ['$$job.studentId', '$$student.studentId'] }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          studentDetails: 0,
          internships: 0,
          interviews: 0,
          jobs: 0,
          collegeDetails: 0
        }
      }
    ]);

    res.json({ applications });
  } catch (error) {
    console.error('Error in applications endpoint:', error);
    res.status(500).json({ message: 'Error fetching applications data', error: error.message });
  }
});

module.exports = router;