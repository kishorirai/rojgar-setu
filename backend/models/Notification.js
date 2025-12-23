const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Sender information
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: false // Make sender optional for system notifications
  },
  senderModel: {
    type: String,
    enum: ['College', 'Student', 'Company', 'System'],
    required: true
  },
  
  // Recipient information
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientModel',
    required: true
  },
  recipientModel: {
    type: String,
    enum: ['College', 'Student', 'Company'],
    required: true
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Notification type and status
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'urgent'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  
  // Action and navigation
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  // Additional metadata
  category: {
    type: String,
    enum: ['academic', 'placement', 'general', 'system', 'announcement'],
    default: 'general'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Delivery tracking
  delivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  
  // Expiration (optional)
  expiresAt: {
    type: Date,
    default: null
  },
  senderDeleted:{
    type:Boolean,
    default:false
  },
  recipientDeleted:{
    type:Boolean,
    default:false,
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ recipient: 1, recipientModel: 1, read: 1, createdAt: -1 });
notificationSchema.index({ sender: 1, senderModel: 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1, createdAt: -1 });
notificationSchema.index({ category: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Pre-save middleware to set readAt when notification is marked as read
notificationSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static method to find notifications for a specific entity
notificationSchema.statics.findForEntity = function(entityId, entityModel, options = {}) {
  const query = {
    recipient: entityId,
    recipientModel: entityModel
  };
  
  if (options.unreadOnly) {
    query.read = false;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .populate('sender', 'name email')
    .populate('recipient', 'name email');
};

// Static method to find sent notifications by an entity
notificationSchema.statics.findSentByEntity = function(entityId, entityModel, options = {}) {
  const query = {
    sender: entityId,
    senderModel: entityModel
  };
  
  if (options.type) {
    query.type = options.type;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .populate('sender', 'name email')
    .populate('recipient', 'name email');
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Instance method to mark as delivered
notificationSchema.methods.markAsDelivered = function() {
  this.delivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema); 