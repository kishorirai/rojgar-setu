const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicationFromCollege: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  applicationToCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  roleName:{
    type:String,
    default:''
  },
  students: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    status: {
      type: String,
      enum: ['applied', 'accepted', 'rejected', 'interview-scheduled', 'interview-rescheduled', 'interview-cancelled'],
      default: 'applied'
    },
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      default: null
    }
  }],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
    required: 'true',
  }
}, {
  timestamps: true
});
delete mongoose.models.Application;
module.exports = mongoose.model('CollegeApplication', applicationSchema); 