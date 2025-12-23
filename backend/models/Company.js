const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['','MNC', 'Startup', 'SME', 'Government', 'NGO', 'Other'],

  },
  industry: {
    type: String,

  },
  website: {
    type: String,

  },
  location: {
    type: String,

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
    required: true
  },
  adminContact: {
    name: String,
    email: String,
    phone: String,
    designation: String
  },
  companySize: {
    type: String,
    enum: ['', '1-50', '51-200', '201-500', '501-1000', '1000+'],

  },
  foundedYear: {
    type: Number,
  },
  description: {
    type: String,
  },
  verificationStatus: {
    type: String,
    enum: ['verified', 'unverified', 'rejected'],
    default: 'unverified'
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: 'https://res.cloudinary.com/dcafjef0a/image/upload/v1/company_profiles/default-company'
  },
  logo: {
    type: String,
    default: ''
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


module.exports = mongoose.model('Company', companySchema); 