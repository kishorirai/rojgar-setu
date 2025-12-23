const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    // Basic email format validation
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['employee', 'hr', 'admin'],
    default: 'employee'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  department: {
    type: String,
    trim: true
  },
  designation: String,
  phone: {
    type: String,
    trim: true
  },
  profileImage: String,
  verified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 4,
    min: 1,
    max: 10,
  },
    feedback: {
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    overallScore: Number,
    comments: String,
    date: Date
  },
  reviews: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Review',
    default: []
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Remove password validation that checks for googleId
employeeSchema.path('password').required(true);

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee; 