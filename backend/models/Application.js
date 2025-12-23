const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: {
    type: String,
    enum: [
      'applied',
      'under_review',
      'interview_scheduled',
      'offer_received',
      'rejected'
    ],
    default: 'applied'
  },
  nextStep: String,
  nextStepDate: Date,
  appliedDate: { type: Date, default: Date.now },
  coverLetter: String,
  experience: String,
  availability: String
});

module.exports = mongoose.model('Application', applicationSchema);