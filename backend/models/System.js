const mongoose = require('mongoose');

const systemSchema = new mongoose.Schema({
  name: {type: String, default:'System Notification'},
},{strict:false});

module.exports = mongoose.model('System', systemSchema); 