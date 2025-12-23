const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const supportTicket = require('./routes/support-ticket')

mongoose.connect('mongodb+srv://harsh:harsh123@campus.k0by8i8.mongodb.net/').then(()=>{
  console.log('Connected to MongoDB');
})
const app = express();
app.use(express.json());  

app.use('/api/support-ticket', supportTicket);

app.listen(2000,()=>{
  console.log('Server is running on port 2000');
})