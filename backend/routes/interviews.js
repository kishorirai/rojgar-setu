const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Employee = require('../models/Employee')
const Application = require('../models/CollegeApplication')
const Student = require('../models/Student')
const {emailTransport} = require('../config/email');
const getZoomAccessToken = require('../utils/zoomOAuth')
const axios = require('axios');
const interviewController = require('../controllers/interviewController');
// Get interviews by student
const zoomConfig = {
  accountId: process.env.ZOOM_ACCOUNT_ID,
  clientId: process.env.ZOOM_CLIENT_ID,
  clientSecret: process.env.ZOOM_CLIENT_SECRET,
  userId: process.env.ZOOM_USER_ID
};

//...........
// app.get('/api/interviews') ..... Get all interviews
// app.post('/api/interviews') ..... Create new interview with Zoom meeting
// app.put('/api/interviews/:id') ..... Update interview details
// app.delete('/api/interviews/:id') ..... Delete interview
// app.get('/api/interviews/student/:studentId') ..... Get interviews by student
// app.get('/api/interviews/company/:companyId') ..... Get interviews by company
// app.post('/api/interviews/:id/accept') ..... Accept candidate after interview
// app.post('/api/interviews/:id/cancel') ..... Cancel scheduled interview
// app.post('/api/interviews/:id/reject') ..... Reject candidate after interview
// app.delete('/api/interviews/clean-rejected') ..... Clean rejected interviews(need to implement in frontend)

router.get('/scheduled', interviewController.getScheduledInterviews);

router.get('/', async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('interviewee', 'name email')
      .populate('interviewer', 'name email')
      .populate('companyId', 'name');
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { interviewer, interviewee, candidateName, role, date, mailSubject, mailBody, applicationId } = req.body;

    // Get interviewer details
    const interviewerUser = await Employee.findById(interviewer)
    const application = await Application.findById(applicationId)
    const companyId = interviewerUser.companyId
    if (!interviewerUser) {
      return res.status(404).json({ message: 'Interviewer not found' });
    }else if(!application){
      return res.status(404).json({ message: 'Application not found' });
    }

    // Generate Zoom meeting using OAuth
    const accessToken = await getZoomAccessToken();
    const zoomRes = await axios.post(
      `https://api.zoom.us/v2/users/${zoomConfig.userId}/meetings`,
      {
        topic: mailSubject || 'Interview Meeting',
        type: 2,
        start_time: new Date(date).toISOString(),
        duration: 60,
        timezone: 'Asia/Kolkata',
        agenda: mailBody || 'Interview',
        settings: {
          join_before_host: true,
          approval_type: 0,
          registration_type: 1,
          enforce_login: false,
          waiting_room: true
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const zoomLink = zoomRes.data.join_url;
    const zoomMeetingId = zoomRes.data.id
    const zoomPassword = zoomRes.data.password

    // Format Date: "11 January 2025, 10:26 AM"
    const dateObj = new Date(date)
    const interviewDate = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
    const interviewTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Create interview document with Zoom link
    const interview = new Interview({
      interviewer,
      interviewee,
      candidateName,
      role,
      link: zoomLink,
      zoomMeetingId,
      zoomPassword,
      date,
      status: 'scheduled',
      interviewDate,
      interviewTime,
      companyId,
    });

    await interview.save();

    // Update application status and link interview
    if (applicationId) {
      const application = await Application.findById(applicationId);
      if (application) {
        const studentIndex = application.students.findIndex(s => s.studentId.toString() === interviewee);
        if (studentIndex !== -1) {
          application.students[studentIndex].status = 'interview-scheduled';
          application.students[studentIndex].interview = interview._id;
          await application.save();
        }
      }
    }

    // Get student details
    const student = await Student.findById(interviewee);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Send email to student
    if (student.email) {
      const studentMailOptions = {
        from: process.env.EMAIL_SENDER,
        to: student.email,
        subject: mailSubject || 'Interview Scheduled',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Interview Scheduled</h2>
            <p>Dear ${student.name},</p>
            <p>${mailBody || 'Your interview has been scheduled.'}</p>
            <p><strong>Date:</strong> ${interviewDate}</p>
            <p><strong>Time:</strong> ${interviewTime}</p>
            <p><strong>Interviewer:</strong> ${interviewerUser.name}</p>
            <p><strong>Zoom Link:</strong> <a href="${zoomLink}">${zoomLink}</a></p>
            <p><strong>Meeting ID:</strong> ${zoomMeetingId}</p>
            <p><strong>Password:</strong> ${zoomPassword}</p>
            <p>Best regards</p>
          </div>
        `
      };

      await emailTransport.sendMail(studentMailOptions);
    }

    // Send email to interviewer
    if (interviewerUser.email) {
      const interviewerMailOptions = {
        from: process.env.EMAIL_SENDER,
        to: interviewerUser.email,
        subject: `Interview Scheduled: ${student.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Interview Scheduled</h2>
            <p>Dear ${interviewerUser.name},</p>
            <p>You have been scheduled to interview ${student.name}.</p>
            <p><strong>Date:</strong> ${interviewDate}</p>
            <p><strong>Time:</strong> ${interviewTime}</p>
            <p><strong>Student Details:</strong></p>
            <ul>
              <li>Name: ${student.name}</li>
              <li>Email: ${student.email}</li>
              <li>Department: ${student.department}</li>
              <li>CGPA: ${student.cgpa}</li>
            </ul>
            <p><strong>Zoom Link:</strong> <a href="${zoomLink}">${zoomLink}</a></p>
            <p><strong>Meeting ID:</strong> ${zoomMeetingId}</p>
            <p><strong>Password:</strong> ${zoomPassword}</p>
            <p>Best regards,<br>HR Team</p>
          </div>
        `
      };

      await emailTransport.sendMail(interviewerMailOptions);
    }

    // Return the updated application along with the interview
    const updatedApplication = await Application.findById(applicationId)
      .populate('applicationFromCollege', 'name')
      .populate('roleId', 'jobTitle')
      .populate('students.studentId', 'name email rollNumber cgpa batch skills');

    res.status(201).json({ interview, application: updatedApplication });
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ message: 'Error creating interview', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/student/:studentId', async (req, res) => {
  try {
    const interviews = await Interview.find({ 
      interviewee: req.params.studentId 
    })
    .populate('companyId', 'name')
    .populate('interviewer', 'name email position')
    .sort({ date: -1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/company/:companyId', async (req, res) => {
  try {
    const interviews = await Interview.find({ 
      companyId: req.params.companyId
    })
    .sort({ date: -1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept candidate
router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentEmail, emailTitle, emailBody } = req.body;

    // Find the interview
    const interview = await Interview.findById(id)
      .populate('interviewee', 'name email')
      .populate('companyId', 'name');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Send acceptance email
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: studentEmail,
      subject: emailTitle,
      html: emailBody
    });

    // Update interview status
    interview.status = 'accepted';
    await interview.save();

    // Find and update the application
    const application = await Application.findOne({
      'students.studentId': interview.interviewee._id,
      'students.interview': interview._id
    });

    if (application) {
      const studentIndex = application.students.findIndex(
        s => s.studentId.toString() === interview.interviewee._id.toString()
      );
      
      if (studentIndex !== -1) {
        application.students[studentIndex].status = 'accepted';
        await application.save();
      }
    }

    res.json({ message: 'Candidate accepted successfully', interview });
  } catch (error) {
    console.error('Error accepting candidate:', error);
    res.status(500).json({ message: 'Error accepting candidate', error: error.message });
  }
});
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentEmail, emailTitle, emailBody } = req.body;

    // Find the interview
    const interview = await Interview.findById(id)
      .populate('interviewee', 'name email')
      .populate('companyId', 'name');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Send acceptance email
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: studentEmail,
      subject: emailTitle,
      html: emailBody
    });

    // Update interview status
    interview.status = 'cancelled';
    await interview.save();

    // Find and update the application
    const application = await Application.findOne({
      'students.studentId': interview.interviewee._id,
      'students.interview': interview._id
    });

    if (application) {
      const studentIndex = application.students.findIndex(
        s => s.studentId.toString() === interview.interviewee._id.toString()
      );
      
      if (studentIndex !== -1) {
        application.students[studentIndex].status = 'interview-cancelled';
        await application.save();
      }
    }

    res.json({ message: 'Interview Cancelled', interview });
  } catch (error) {
    console.error('Error Cancelling Interview:', error);
    res.status(500).json({ message: 'Error Cancelling Interview', error: error.message });
  }
});

// Reject candidate
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentEmail, emailTitle, emailBody } = req.body;

    // Find the interview
    const interview = await Interview.findById(id)
      .populate('interviewee', 'name email')
      .populate('companyId', 'name');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Send rejection email
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: studentEmail,
      subject: emailTitle,
      html: emailBody
    });

    // Find and update the application
    const application = await Application.findOne({
      'students.studentId': interview.interviewee._id,
      'students.interview': interview._id
    });

    if (application) {
      const studentIndex = application.students.findIndex(
        s => s.studentId.toString() === interview.interviewee._id.toString()
      );
      
      if (studentIndex !== -1) {
        application.students[studentIndex].status = 'rejected';
        await application.save();
      }
    }

    // Delete the interview
    await Interview.findByIdAndDelete(id);

    res.json({ message: 'Candidate rejected successfully' });
  } catch (error) {
    console.error('Error rejecting candidate:', error);
    res.status(500).json({ message: 'Error rejecting candidate', error: error.message });
  }
});

// Clean rejected interviews
router.delete('/clean-rejected', async (req, res) => {
  try {
    const result = await Interview.deleteMany({ status: 'rejected' });
    res.json({ 
      message: 'Successfully cleaned rejected interviews',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error cleaning rejected interviews:', error);
    res.status(500).json({ message: 'Error cleaning rejected interviews', error: error.message });
  }
});

module.exports = router; 