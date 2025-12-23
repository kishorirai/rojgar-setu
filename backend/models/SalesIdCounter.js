const mongoose = require('mongoose');

const SalesIdCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('SalesIdCounter', SalesIdCounterSchema);