const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket'); // Import the SupportTicket model
const Student = require('../models/Student');
const College = require('../models/College');
const Company = require('../models/Company');
const jwt = require('jsonwebtoken'); // to verify JWT tokens
const { v4: uuidv4 } = require('uuid'); // to generate unique ticketId
const User = require('../models/User'); // Import the User model
const Notification = require('../models/Notification');
const {emailTransport, emailSender} = require('../config/email');
const multer = require('multer'); // for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });


assignTicketToSales = async(ticketID) =>{
  freeSales = await User.findOne({}).sort({workload:1});
  
  const ticket = await SupportTicket.findOne({ ticketId: ticketID });
  if (!ticketID) throw new Error("Ticket ID is required");
 

  ticket.assignedTo = freeSales.email; 

  ticket.salesPerson = freeSales.firstName + " " + freeSales.lastName; // Store the sales person's ID
  await ticket.save();

  freeSales.workload += 1; // Increment the workload of the sales person
  await freeSales.save();
  console.log(`Assigned ticket ${ticketID} to ${freeSales.email}`);
  return ticket;
}

function generateSecretCode(){
  return Math.floor(1000+ Math.random() * 9000).toString(); // Generates a random 4-digit number
}

// Route: POST /api/support-tickets
router.post('/', upload.single('uploadedFile'), async (req, res) => {
  const authHeader = req.headers['authorization']; // or req.get('Authorization')
  // console.log("REQ FILE:", req.file);
  // console.log("REQ BODY:", req.body);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing or malformed' });
  }
  const token = authHeader.split(' ')[1]; // Get the token after "Bearer"
  const decoded = jwt.verify(token, process.env.SESSION_SECRET);
  const salesId = decoded.salesId;
  //console.log("salesId:", salesId, "decoded:", decoded);
  const sales = await User.findOne({salesId: salesId});
  if (!sales) {
    return res.status(401).json({ error: 'Sales ID not found' });
  }
  //console.log("sales:", sales);

  try {
    const {
      title,
      description,
      priority,
      status,
      category,
      user_name,
      user_email,
      user_phone,
      userType
    } = req.body;

    // Validate required fields
    if (!title || !description || !userType) {
      return res.status(400).json({ error: 'Title, description and userType are required.' });
    }
    let recipient, userId;
    if(userType.toLowerCase() === "student"){
      recipient = await Student.findOne({email: user_email}).select('_id').lean();
    }
    else if(userType.toLowerCase() === "college"){
      recipient = await College.findOne({contactEmail: user_email}).select('_id').lean();
    }
    else if(userType.toLowerCase() === "company"){
      recipient = await Company.findOne({contactEmail: user_email}).select('_id').lean();
    }
    if(!recipient){
      return res.status(400).json({ error: 'Recipient not in College, Company or Student' });
    }
    console.log("recipient:", recipient);
    userId = recipient._id;
    // Create new support ticket
    const newTicket = new SupportTicket({
      ticketId: uuidv4(),
      userType,
      userId,
      user_name,
      user_email,
      user_phone,
      email: user_email,
      subject: title,
      description,
      priority,
      status: status || "open",
      category,
      uploadedFile: req.file ? {
            data: req.file.buffer,
            contentType: req.file.mimetype,
            filename: req.file.originalname,
            size: req.file.size
          }
        : undefined,
      secretCode: generateSecretCode(),
      salesId: salesId,
      assignedTo: sales.email,
      salesPerson: sales.firstName + " " + sales.lastName
    });
    const savedTicket = await newTicket.save();
    sales.workload += 1;
    await sales.save();
      
    let autoMsg = `Your Ticket No. #${newTicket.ticketId} has been generated for [${newTicket.subject}]. Your issue will be resolved within 3–4 hours. Please use this secret code: ${newTicket.secretCode} to close your complaint after resolution.`;
    autoMsg += `\n\nYour ticket was assigned to ${sales.firstName} ${sales.lastName}.`;
    await Notification.create({
      sender:userId,
      senderModel: 'Student',
      recipient:userId,
      recipientModel: 'Student',
      title: "Your issue has been raised",
      message:autoMsg,
      category:'system',
      actionUrl: `/chat`,
      actionText: 'Show Ticket',
      type: 'info',
      priority: 'normal',
    })

    await emailTransport.sendMail({
      from:emailSender,
      to:user_email,
      subject:'Your Ticket has been raised',
      text: autoMsg,
    })

    res.status(201).json({ message: 'Support ticket created successfully', ticket: savedTicket });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
