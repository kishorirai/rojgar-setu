const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  interviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  candidateName: { type: String },
  campusScore: { type: Number },
  link: { type: String },
  zoomMeetingId: { type: String },
  zoomPassword: { type: String },
  isDone: { type: Boolean, default: false },
  date: { type: Date, required: true },
  feedback: {
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    overallScore: Number,
    comments: String,
    date: Date
  },
  role: { type: String, default:'SDE'},
  status: { type: String, enum: ["scheduled", "in-progress", "completed", "cancelled", "selected", "rejected", "accepted"], default: "scheduled" },
  interviewDate: { type: String },
  interviewTime: { type: String },
 
  notes: { type: String ,default: "keep a pen and paper with you"}
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema); 