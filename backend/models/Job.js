const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Interview'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
  },
  salary: {
    type: Number,
    required: true
  },
  mode: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    required: true
  },
  status: {
    type: String,
    enum: ['offered', 'accepted', 'rejected', 'completed'],
    default: 'offered'
  },
  feedback: {
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    overallScore: Number,
    comments: String,
    date: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
jobSchema.index({ studentId: 1, companyId: 1 });
jobSchema.index({ status: 1 });

module.exports = mongoose.model('Job', jobSchema); 