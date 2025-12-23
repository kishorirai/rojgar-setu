
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4  
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  type:{
    type: String,
    required: true,
    default: 'sales'
  },
  salesId: {
    type: String,
    required: true,
    unique: true
  },
  workload:{
    type: Number,
    default: 0
  },
  phone:{
    type: String,
  }
});

// UserSchema.plugin(AutoIncrement, { inc_field: 'salesId',start_seq: 1001 });
module.exports = mongoose.model('user', UserSchema);
