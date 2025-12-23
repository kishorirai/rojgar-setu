const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const Interview = require('../models/Interview');
const mongoose = require('mongoose');

// Get all internships
router.get('/', async (req, res) => {
  try {
    const internships = await Internship.find()
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get internships by student id
router.get('/student/:studentId', async (req, res) => {
  try {
    // Validate studentId
    if (!req.params.studentId || !mongoose.Types.ObjectId.isValid(req.params.studentId)) {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    const internships = await Internship.find({ 
      studentId: new mongoose.Types.ObjectId(req.params.studentId)
    })
    .populate('companyId', 'name')
    .populate('interviewId')
    .sort({ createdAt: -1 });

    // Return empty array if no internships found
    res.json(internships || []);
  } catch (err) {
    console.error('Error in /student/:studentId route:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get internships by company
router.get('/company/:companyId', async (req, res) => {
  try {
    const internships = await Internship.find({ companyId: req.params.companyId })
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single internship
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('companyId', 'name')
      .populate('applications.studentId', 'name email rollNumber department batch cgpa');
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.json(internship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new internship
router.post('/', async (req, res) => {
  try {
    const internship = new Internship(req.body);
    const savedInternship = await internship.save();
    res.status(201).json(savedInternship);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update internship
router.put('/:id', async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.json(internship);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete internship
router.delete('/:id', async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.json({ message: 'Internship deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Apply for internship
router.post('/:id/apply', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Check if already applied
    const alreadyApplied = internship.applications.some(
      app => app.studentId.toString() === req.body.studentId
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this internship' });
    }

    // Add application
    internship.applications.push({
      studentId: req.body.studentId,
      resume: req.body.resume,
      coverLetter: req.body.coverLetter
    });
    internship.applied += 1;

    await internship.save();
    res.status(201).json(internship);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update application status
router.put('/:id/applications/:studentId', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    const application = internship.applications.find(
      app => app.studentId.toString() === req.params.studentId
    );
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = req.body.status;
    if (req.body.status === 'interview-scheduled' && req.body.interviewId) {
      application.interview = req.body.interviewId;
    }

    await internship.save();
    res.json(internship);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get internships by department
router.get('/department/:department', async (req, res) => {
  try {
    const internships = await Internship.find({ 
      department: req.params.department,
      status: 'active'
    })
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get internships by type
router.get('/type/:type', async (req, res) => {
  try {
    const internships = await Internship.find({ 
      type: req.params.type,
      status: 'active'
    })
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get internships by student


module.exports = router; 