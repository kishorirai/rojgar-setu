const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Interview = require('../models/Interview');

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const jobs = await Job.find({ 
      'studentId': req.params.studentId 
    })
    .populate('companyId', 'name')
    .populate('interviewId')
    .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get jobs by company
router.get('/company/:companyId', async (req, res) => {
  try {
    const jobs = await Job.find({ companyId: req.params.companyId })
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('companyId', 'name')
      .populate('applications.studentId', 'name email rollNumber department batch cgpa');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new job
router.post('/', async (req, res) => {
  try {
    const job = new Job(req.body);
    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update job
router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Apply for job
router.post('/:id/apply', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const alreadyApplied = job.applications.some(
      app => app.studentId.toString() === req.body.studentId
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    // Add application
    job.applications.push({
      studentId: req.body.studentId,
      resume: req.body.resume,
      coverLetter: req.body.coverLetter
    });
    job.applied += 1;

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update application status
router.put('/:id/applications/:studentId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const application = job.applications.find(
      app => app.studentId.toString() === req.params.studentId
    );
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = req.body.status;
    if (req.body.status === 'interview-scheduled' && req.body.interviewId) {
      application.interview = req.body.interviewId;
    }

    await job.save();
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get jobs by student


module.exports = router; 