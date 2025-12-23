const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    trim: true
  },
  location: {
    type: String,
  },
  website: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address']
  },
  contactPhone: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  placementOfficer: {
    name: String,
    email: String,
    phone: String
  },
  departments: [{
    name: String,
    code: String
  }],
 
  establishedYear: {
    type: Number,
  },
  campusSize: {
    type: Number, // in acres
  },
  profileImage: {
    type: String,
    default: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/college_profiles/default-college'
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  logo: {
    type: String,
    default: ''
  },  
  verificationStatus: {
    type: String,
    enum: ['verified', 'unverified', 'rejected'],
    default: 'unverified'
  }, 
  isVerified: {
    type: Boolean,
    default: false
  },
  salesId: {
    type: String,
    required: false,
    unique: true
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  referralCode: { type: String, unique: true },
}, {
  timestamps: true
});

// Remove password validation that checks for googleId
collegeSchema.path('password').required(true);

const College = mongoose.model('College', collegeSchema);

module.exports = College; 