const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  numberOfStudents: {
    type: Number,
    required: true,
    min: 1
  },
  stipend: {
    type: Number,
    required: true,
    min: 0
  },
  jobType: {
    type: String,
    required: true,
    enum: ['internship', 'full-time', 'part-time', 'contract']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true,
    trim: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  applied: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema); 