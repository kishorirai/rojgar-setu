const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  platformName: { type: String, required: true },
  supportEmail: { type: String, required: true },
  maintenanceMode: { type: Boolean, default: false },
  maxFileSize: { type: Number, default: 10 },
  sessionTimeout: { type: Number, default: 120 },
  publicRegistration: { type: Boolean, default: true },
  maxLoginAttempts: { type: Number, default: 5 },
  lockoutDuration: { type: Number, default: 30 },
  jwtExpiry: { type: Number, default: 24 },
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  pushNotifications: { type: Boolean, default: true },
  autoApproveStudents: { type: Boolean, default: false },
  autoApproveCompanies: { type: Boolean, default: false },
  profileVerificationRequired: { type: Boolean, default: true },
  maxResumeSize: { type: Number, default: 5 },
  profileCompletion: { type: Number, default: 80 },
  inactivityPeriod: { type: Number, default: 90 },
  googleOAuth: { type: Boolean, default: true },
  linkedInOAuth: { type: Boolean, default: true },
  microsoftOAuth: { type: Boolean, default: false },
  paymentGatewayActive: { type: Boolean, default: true },
  emailServiceActive: { type: Boolean, default: true },
  analyticsStatus: { type: String, default: 'pending' },
  autoBackup: { type: Boolean, default: true },
  backupRetention: { type: Number, default: 30 },
  autoUpdates: { type: Boolean, default: true },
  maintenanceWindow: { type: String, default: '02:00 - 04:00 UTC' }
});

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);
module.exports = PlatformSettings;