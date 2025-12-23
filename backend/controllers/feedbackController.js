const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const Job = require('../models/Job');
const Interview = require('../models/Interview');
const Internship = require('../models/Internship');
const Employee = require('../models/Employee');
const Review = require('../models/Review');

// Give feedback (student gives feedback on a specific target)
exports.giveFeedback = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { 
      feedbackTargetType, 
      feedbackTargetId, 
      company, 
      position, 
      rating, 
      feedback 
    } = req.body;

    // Validate target type
    const validTargetTypes = ['job', 'interview', 'internship', 'interviewer'];
    if (!validTargetTypes.includes(feedbackTargetType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid feedback target type' 
      });
    }

    // Determine target model based on type
    let targetModel;
    switch (feedbackTargetType) {
      case 'job':
        targetModel = 'Job';
        break;
      case 'interview':
        targetModel = 'Interview';
        break;
      case 'internship':
        targetModel = 'Internship';
        break;
      case 'interviewer':
        targetModel = 'Employee';
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid target type' 
        });
    }

    // Verify the target exists and belongs to the student (for jobs, interviews, internships)
    if (feedbackTargetType !== 'interviewer') {
      const target = await mongoose.model(targetModel).findById(feedbackTargetId);
      if (!target) {
        return res.status(404).json({ 
          success: false, 
          message: `${feedbackTargetType} not found` 
        });
      }

      // Check if the target belongs to the student
      if (target.studentId && target.studentId.toString() !== studentId) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only give feedback on your own experiences' 
        });
      }

      // For interviews, check if the student is the interviewee
      if (feedbackTargetType === 'interview' && target.interviewee.toString() !== studentId) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only give feedback on interviews you participated in' 
        });
      }
    }

    // Extract metadata based on target type
    let metadata = {};
    if (feedbackTargetType === 'job') {
      const job = await Job.findById(feedbackTargetId).populate('companyId', 'name');
      metadata = {
        jobTitle: job.title,
        salary: job.salary,
        department: job.department
      };
    } else if (feedbackTargetType === 'interview') {
      const interview = await Interview.findById(feedbackTargetId)
        .populate('interviewer', 'name')
        .populate('companyId', 'name');
      metadata = {
        interviewerName: interview.interviewer?.name,
        interviewDate: interview.date,
        role: interview.role
      };
    } else if (feedbackTargetType === 'internship') {
      const internship = await Internship.findById(feedbackTargetId).populate('companyId', 'name');
      metadata = {
        internshipTitle: internship.title,
        stipend: internship.stipend
      };
    } else if (feedbackTargetType === 'interviewer') {
      const interviewer = await Employee.findById(feedbackTargetId).populate('companyId', 'name');
      metadata = {
        interviewerPosition: interviewer.designation,
        companyName: interviewer.companyId?.name
      };
    }

    // Check if feedback already exists for this target
    const existingFeedback = await Feedback.findOne({
      student: studentId,
      'feedbackTarget.targetId': feedbackTargetId,
      'feedbackTarget.type': feedbackTargetType
    });

    if (existingFeedback) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already given feedback for this target' 
      });
    }

    // Create new feedback
    const newFeedback = new Feedback({
      student: studentId,
      feedbackTarget: {
        type: feedbackTargetType,
        targetId: feedbackTargetId,
        targetModel: targetModel
      },
      company,
      position,
      rating,
      feedback,
      metadata
    });

    await newFeedback.save();

    // Populate the feedback for response
    const populatedFeedback = await Feedback.findById(newFeedback._id)
      .populate('student', 'name email')
      .populate('feedbackTarget.targetId');

    res.status(201).json({ 
      success: true, 
      feedback: populatedFeedback 
    });
  } catch (err) {
    console.error('Error giving feedback:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Get feedback given by student
exports.getGivenFeedback = async (req, res) => {
  try {
    const studentId = req.user.id;
    const feedbacks = await Feedback.find({ 
      student: studentId
    })
    .populate('student', 'name email')
    .populate('feedbackTarget.targetId')
    .sort({ date: -1 });

    res.json({ 
      success: true, 
      feedbacks 
    });
  } catch (err) {
    console.error('Error getting given feedback:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Get feedback received by student (from companies/mock interviewers)
exports.getReceivedFeedback = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Fetch reviews where the student is the one being reviewed
    const reviews = await Review.find({ 
      belongsTo: studentId, 
      belongsToModel: 'Student' 
    })
    .sort({ 'feedback.date': -1, createdAt: -1 });

    // Format reviews to match feedback structure
    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      company: review.entityName || '',
      position: 'Student Performance',
      rating: review.feedback.overallScore || 0,
      feedback: review.feedback.comments || 'No comments provided',
      sentiment: review.feedback.overallScore >= 4 ? 'positive' : 
                 review.feedback.overallScore >= 2 ? 'constructive' : 'negative',
      date: review.feedback.date || review.createdAt,
      type: 'review',
      reviewerName: review.reviewerName || '',
      entityName: review.entityName || '',
      reviewedBy: review.reviewedByModel,
      metadata: {
        technicalScore: review.feedback.technicalScore,
        communicationScore: review.feedback.communicationScore,
        problemSolvingScore: review.feedback.problemSolvingScore,
        overallScore: review.feedback.overallScore
      }
    }));

    res.json({ 
      success: true, 
      feedbacks: formattedReviews 
    });
  } catch (err) {
    console.error('Error getting received feedback:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// PATCH: Edit feedback (student can only edit their own feedback)
exports.editFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const studentId = req.user.id;
    const { company, position, rating, feedback } = req.body;

    // Only allow editing of feedback given by the student
    const fb = await Feedback.findOne({ 
      _id: feedbackId, 
      student: studentId
    });

    if (!fb) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found or permission denied' 
      });
    }

    // Update fields
    fb.company = company || fb.company;
    fb.position = position || fb.position;
    fb.rating = rating || fb.rating;
    fb.feedback = feedback || fb.feedback;
    
    // Sentiment will be automatically updated by pre-save middleware
    await fb.save();

    // Populate the updated feedback
    const updatedFeedback = await Feedback.findById(fb._id)
      .populate('student', 'name email')
      .populate('feedbackTarget.targetId');

    res.json({ 
      success: true, 
      feedback: updatedFeedback 
    });
  } catch (err) {
    console.error('Error editing feedback:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// DELETE: Delete feedback (student can only delete their own feedback)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const studentId = req.user.id;

    // Only allow deleting feedback given by the student
    const fb = await Feedback.findOneAndDelete({ 
      _id: feedbackId, 
      student: studentId
    });

    if (!fb) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found or permission denied' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Feedback deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Get feedback statistics for a student
exports.getFeedbackStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const givenFeedback = await Feedback.find({ student: studentId });

    const stats = {
      givenCount: givenFeedback.length,
      receivedCount: 0, // For now, no received feedback
      avgRatingGiven: givenFeedback.length > 0 
        ? (givenFeedback.reduce((sum, fb) => sum + fb.rating, 0) / givenFeedback.length).toFixed(1)
        : '0.0',
      avgRatingReceived: '0.0', // For now, no received feedback
      feedbackByType: {
        job: givenFeedback.filter(fb => fb.feedbackTarget.type === 'job').length,
        interview: givenFeedback.filter(fb => fb.feedbackTarget.type === 'interview').length,
        internship: givenFeedback.filter(fb => fb.feedbackTarget.type === 'internship').length,
        interviewer: givenFeedback.filter(fb => fb.feedbackTarget.type === 'interviewer').length
      }
    };

    res.json({ 
      success: true, 
      stats 
    });
  } catch (err) {
    console.error('Error getting feedback stats:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};