const mongoose = require('mongoose');

const placementDataSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  roleStatus: {
    type: String,
    required: true,
    enum: ['Placed', 'Intern', 'NotPlaced'],
  },
  companyName: {
    type: String,
    required: function () {
      return this.roleStatus !== 'NotPlaced';
    },
    trim: true,
  },
  salary: {
    type: Number,
    min: 0,
    required: function () {
      return this.roleStatus === 'Placed';
    },
  },
  offerDate: {
    type: Date,
    required: function () {
      return this.roleStatus !== 'NotPlaced';
    },
  },
  year: {
    type: String,
    required: true,
    match: /^\d{4}$/,    // Ensures year is a 4-digit number, Proper matching for year format
  },
}, {
  timestamps: true,
});

// Indexes for performance
placementDataSchema.index({ department: 1 });
placementDataSchema.index({ roleStatus: 1 });
placementDataSchema.index({ year: 1 });
placementDataSchema.index({ offerDate: 1 });

const PlacementData = mongoose.model('PlacementData', placementDataSchema);

module.exports = PlacementData;