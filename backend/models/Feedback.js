const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // Student who is giving the feedback
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  
  // Feedback target - what the feedback is about
  feedbackTarget: {
    type: { 
      type: String, 
      enum: ['job', 'interview', 'internship', 'interviewer'], 
      required: true 
    },
    // Reference to the specific target
    targetId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true 
    },
    // Target model for population
    targetModel: { 
      type: String, 
      enum: ['Job', 'Interview', 'Internship', 'Employee'], 
      required: true 
    }
  },
  
  // Company information (for display purposes)
  company: { 
    type: String, 
    required: true 
  },
  
  // Position/role information
  position: { 
    type: String, 
    required: true 
  },
  
  // Rating and feedback content
  rating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    required: true 
  },
  feedback: { 
    type: String, 
    required: true 
  },
  
  // Sentiment analysis
  sentiment: { 
    type: String, 
    enum: ['positive', 'constructive', 'negative'], 
    default: 'positive' 
  },
  
  // Additional metadata
  metadata: {
    // For job feedback
    jobTitle: String,
    salary: Number,
    department: String,
    
    // For interview feedback
    interviewerName: String,
    interviewDate: Date,
    role: String,
    
    // For internship feedback
    internshipTitle: String,
    stipend: Number,
    
    // For interviewer feedback
    interviewerPosition: String,
    companyName: String
  },
  
  // Timestamps
  date: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
feedbackSchema.index({ student: 1, 'feedbackTarget.type': 1 });
feedbackSchema.index({ 'feedbackTarget.targetId': 1 });
feedbackSchema.index({ date: -1 });

// Pre-save middleware to set sentiment based on rating
feedbackSchema.pre('save', function(next) {
  if (this.rating >= 4) {
    this.sentiment = 'positive';
  } else if (this.rating >= 2) {
    this.sentiment = 'constructive';
  } else {
    this.sentiment = 'negative';
  }
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);