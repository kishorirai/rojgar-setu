const mongoose = require('mongoose');

const registrationOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  type: { type: String, required: true, enum: ['college', 'student', 'company', 'employee', 'sales'] },
  data: { type: Object, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('RegistrationOtp', registrationOtpSchema); 