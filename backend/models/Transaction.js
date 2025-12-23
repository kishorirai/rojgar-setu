const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Payment provider details
  payomatixId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Internal correlation ID (usually student ID)
  correlationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Transaction status
  status: {
    type: String,
    enum: ['pending', 'success', 'completed', 'failed', 'cancelled', 'refunded'],
    required: true
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'INR',
    trim: true
  },
  
  // Customer information
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  customerName: {
    type: String,
    trim: true
  },
  
  customerPhone: {
    type: String,
    trim: true
  },
  
  // Transaction metadata
  message: {
    type: String,
    trim: true
  },
  
  failureReason: {
    type: String,
    trim: true
  },
  
  // Timestamps
  receivedAt: {
    type: Date,
    default: Date.now
  },
  
  processedAt: {
    type: Date,
    default: Date.now
  },
  
  // Payment method (if available)
  paymentMethod: {
    type: String,
    trim: true
  },
  
  // Gateway response (if available)
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Retry information
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastRetryAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ payomatixId: 1 });
transactionSchema.index({ correlationId: 1 });
transactionSchema.index({ customerEmail: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ receivedAt: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toFixed(2)}`;
});

// Method to check if transaction is successful
transactionSchema.methods.isSuccessful = function() {
  return ['success', 'completed'].includes(this.status);
};

// Method to check if transaction failed
transactionSchema.methods.isFailed = function() {
  return ['failed', 'cancelled'].includes(this.status);
};

// Static method to find transactions by student
transactionSchema.statics.findByStudent = function(studentId) {
  return this.find({ correlationId: studentId }).sort({ createdAt: -1 });
};

// Static method to find successful transactions
transactionSchema.statics.findSuccessful = function() {
  return this.find({ status: { $in: ['success', 'completed'] } });
};

// Pre-save middleware to update processedAt
transactionSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.processedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema); 