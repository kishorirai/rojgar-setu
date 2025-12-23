const Job = require('../models/Job');

// List jobs with search, filter, pagination
exports.listJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const query = {};

    if (type) {
      if (type === 'internship') query.type = 'Internship';
      else if (type === 'job') query.type = 'Full-time';
      else if (type === 'part-time') query.type = 'Part-time';
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      jobs,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getJobDetails = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Job application - now expects JSON, no file upload
exports.applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Basic validation
    const { fullName, email, phone, coverLetter, experience, availability } = req.body;
    if (!fullName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Full name, email, and phone are required.' });
    }

    // Optionally increment applicants
    job.applicants = (job.applicants || 0) + 1;
    await job.save();

    res.json({ success: true, message: 'Application received!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};