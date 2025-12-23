const Interview = require('../models/Interview');

// GET: Fetch all interviews for the logged-in student
exports.getMyInterviews = async (req, res) => {
  try {
    const studentId = req.user.id; // from JWT
    const interviews = await Interview.find({ student: studentId })
      .populate('job')
      .sort({ date: 1, time: 1 });

    res.json({ success: true, interviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH: Update preparation progress for a given interview (student only)
exports.updatePreparationProgress = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const studentId = req.user.id;
    const { preparationProgress } = req.body; // [true, false, ...]

    // Only allow if this interview belongs to the student
    const interview = await Interview.findOne({ _id: interviewId, student: studentId });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Validate length
    if (
      !Array.isArray(preparationProgress) ||
      preparationProgress.length !== (interview.preparation ? interview.preparation.length : 0)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid preparationProgress array' });
    }

    interview.preparationProgress = preparationProgress;
    await interview.save();

    res.json({ success: true, preparationProgress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET: Fetch all scheduled or in-progress interviews (for support panel)
exports.getScheduledInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ 
      status: { $in: ['scheduled', 'in-progress'] },
      isDone: false
    })
      .populate('interviewer', 'firstName lastName email')
      .populate('interviewee', 'firstName lastName email');
    res.json({ success: true, interviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch scheduled interviews', error: err.message });
  }
};