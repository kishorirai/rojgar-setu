const mongoose = require('mongoose');
const { type } = require('os');

const SupportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: false 
  },
  userType: {
    type: String,
    enum: ['College', 'Company', 'Student', 'Employee', 'Admin',''],
    default:'',
    required: true
  },
  user_name:{
    type: String,
    required: true
  },
  user_email:{
    type: String,
    required: true
  },
  user_phone:{
    type: String,
  },
  subject: {
    type: String,
    required: true
  },
  description: { // will be used as initial message content
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'], // use 'in-progress' not 'in_progress' for consistency with frontend/backend
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  messages: [{
    sender: {
      type: String,
      required: true
    },
    senderType: {
      type: String,
      enum: ['user', 'support_bot', 'admin'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isBotResponse: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    // enum: ['technical', 'billing', 'general', 'feature_request', 'bug_report'],
    default: 'general'
  },
  assignedTo: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: false
  },
  secretCode: {
    type: String,
    required: true
  },
  closed: {
    type: Boolean,
    default: false
  },
  closedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  escalatedToManager: {
    type: Boolean,
    default: false
  },
  uploadedFile: {
  data: Buffer,         // Actual file data
  contentType: String,  // e.g., 'image/png', 'application/pdf'
  },
  evaluation: {
  type: Boolean,
  default: false
  },
  salesPerson:{
    type: String,
    default: null
  },
  workload:{
    type : Number,
    default: 0
  }
});

// Update the updatedAt field before saving
// SupportTicketSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// })

module.exports = mongoose.model('SupportTicket', SupportTicketSchema); 
