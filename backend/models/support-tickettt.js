const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: { // will be used as initial message content
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'general', 'feature_request', 'bug_report'],
    default: 'general',
  },
  messages: [
    {
      sender: {
        type: String,
        required: true,
      },
      senderType: {
        type: String,
        enum: ['user', 'support_bot', 'admin'],
        default: 'user',
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      isBotResponse: {
        type: Boolean,
        default: false,
      },
    },
  ],
  uploadedFile: {
    type: String, // store file name or file URL
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically update the `updatedAt` field on save
SupportTicketSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Automatically push the description as the first message
SupportTicketSchema.pre('validate', function (next) {
  if (this.isNew && this.description) {
    this.messages = [
      {
        sender: this.ticketId || 'system',
        senderType: 'user',
        message: this.description,
        timestamp: Date.now(),
        isBotResponse: false,
      },
    ];
  }
  next();
});

module.exports = mongoose.model('NewSupportTicket', SupportTicketSchema);
