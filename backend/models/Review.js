const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'belongsToModel'
  },
  belongsToModel: {
    type: String,
    enum: ['Employee', 'Company', 'College', 'Student'],
    required: true
  },
  reviewedByModel: {
    type: String,
    enum: ['Employee', 'Company', 'College', 'Student'],
    required: true
  },
  reviewerName: String,
  entityName: String,
  feedback: {
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    overallScore: Number,
    comments: String,
    date: Date
  },
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
