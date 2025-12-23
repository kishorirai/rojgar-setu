const mongoose = require('mongoose');
require('dotenv').config({path:'../.env'})
console.log(process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.once('open', async () => {
  await mongoose.connection.db.collection('students').dropIndex('rollNumber_1');
  console.log('Dropped unique index on rollNumber');
  process.exit(0);
});