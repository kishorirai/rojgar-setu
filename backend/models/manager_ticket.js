const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['College', 'Company', 'Student', 'student','college','company', ''],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
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
    enum: ['technical', 'billing', 'general', 'feature_request', 'bug_report'],
    default: 'general'
  },
  assignedTo: {
    type: String,
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
  }
});

// Update the updatedAt field before saving
SupportTicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ManagerSupportTicket', SupportTicketSchema); 