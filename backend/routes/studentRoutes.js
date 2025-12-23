const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const {generateStudentToken} = require('../controllers/authController');
const authMiddleware  = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/uploadMiddleware');
const Student = require('../models/Student')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {emailTransport, emailSender} = require('../config/email'); // Adjust this path as per your project structure
const jwt = require('jsonwebtoken');
const SupportTicket = require('../models/SupportTicket');
const {v4: uuidv4} = require('uuid');
const User = require('../models/User');
// Import your Mongoose models
const RegistrationOtp = require('../models/RegistrationOtp'); // Adjust this path
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const Notification = require('../models/Notification');
const { createStudentNotification } = require('../utils/notificationHelper');
require('dotenv').config();


assignTicketToSales = async(ticketID) =>{
  freeSales = await User.findOne({}).sort({workload:1});
  const ticket = await SupportTicket.findOne({ ticketId: ticketID });
  if (!ticketID) throw new Error("Ticket ID is required");
  ticket.assignedTo = freeSales.email; 
  ticket.salesPerson = freeSales.firstName + " " + freeSales.lastName; // Store the sales person's ID
  await ticket.save();
  freeSales.workload += 1; // Increment the workload of the sales person
  await freeSales.save();
  //console.log(`Assigned ticket ${ticketID} to ${freeSales.email}`);
  return ticket;
}
// Profile routes using /me (token-based auth)
router.get('/me', authMiddleware, studentController.getOwnProfile);
router.put('/me', authMiddleware, studentController.updateOwnProfile);
router.post('/me/profile-pic', authMiddleware, imageUpload.single('profilePic'), studentController.uploadProfilePic);
router.get('/me/profile-pic', authMiddleware, studentController.getProfilePic);

router.post('/register/initiate', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      referralCode // optional
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check for duplicate email or phone
    const existing = await Student.findOne({ $or: [ { email }, {phone} ] });
    if (existing) {
      return res.status(409).json({ error: 'Student with this email or phone already exists' });
    }
    
    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Remove any previous OTP for this email
    await RegistrationOtp.deleteMany({ email: email, type: 'student' });

    // Store OTP and student info
    const registrationOtp = new RegistrationOtp({
      email: email,
      otp,
      expiresAt,
      type: 'student',
      data: {
        name,
        email,
        phone,
        referralCode
      }
    });
    await registrationOtp.save();
    // Send OTP email
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: `Hi ${name} Your Student Registration OTP`,
      text: `Your OTP for student registration is: ${otp}\nThis OTP is valid for 5 minutes.`
    });

    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error('Error initiating student registration:', err);
    res.status(500).json({ error: 'Failed to initiate registration', details: err.message });
  }
});

// Verify OTP and complete college registration
router.post('/register/verify', async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !password ) {
      return res.status(400).json({ error: 'Missing required fields: email, otp, password, and confirm password.' });
    }
    // Find the OTP entry
    const registrationOtp = await RegistrationOtp.findOne({ email, type: 'student' });
    if (!registrationOtp) {
      return res.status(400).json({ error: 'Invalid email or registration session expired.' });
    }
    // Check if OTP is valid and not expired
    if (registrationOtp.expiresAt < new Date()) {
      // Delete the invalid/expired OTP to prevent further attempts
      await RegistrationOtp.deleteOne({ _id: registrationOtp._id });
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Optional: Add password strength validation here if needed

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the college using stored info and hashed password
    const StudentInfo = registrationOtp.data; // Get college info from the generic data field
    const newStudent = new Student({
      ...StudentInfo,
      password: hashedPassword // Use the hashed password
    });

    await newStudent.save();
    newStudent.id=await Student.findOne({email}).select("_id").lean();
    await RegistrationOtp.deleteOne({ _id: registrationOtp._id });
    
    // Create welcome notification for the new student
    try {
      await createStudentNotification(
        newStudent._id,
        'Welcome to Campus Admin! 🎉',
        `Hi ${newStudent.name}! Welcome to your student dashboard. Complete your profile to get more opportunities and start your journey towards your dream career.`,
        {
          type: 'success',
          category: 'general',
          actionUrl: '/studentProfile',
          actionText: 'Complete Profile',
          priority: 'high'
        }
      );

      // Create a KYC reminder notification
      await createStudentNotification(
        newStudent._id,
        'Complete Your KYC Verification',
        'To access all features and apply for jobs, please complete your KYC verification. This helps ensure a secure and trusted platform.',
        {
          type: 'warning',
          category: 'system',
          actionUrl: '/studentProfile?tab=verification',
          actionText: 'Verify Now',
          priority: 'normal'
        }
      );

      // Create a feature introduction notification
      await createStudentNotification(
        newStudent._id,
        'Discover Our Features',
        'Explore our AI-powered portfolio builder, job matching system, and comprehensive career tools to enhance your job search.',
        {
          type: 'info',
          category: 'system',
          actionUrl: '/portfolio',
          actionText: 'Explore Features',
          priority: 'normal'
        }
      );

    } catch (notificationError) {
      console.error('Error creating welcome notifications:', notificationError);
      // Don't fail registration if notification creation fails
    }
    
    const token = generateStudentToken(newStudent);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Prevent CSRF attacks
    });
    res.status(201).json({
      token,
      student: {
        id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email
      }
    });

  } catch (err) {
    console.error('Error verifying OTP and registering college:', err);
    res.status(500).json({ error: 'Some error occured!', details: err.message });
  }
});
router.get('/support/tickets', async (req, res) => {

  try{
    let tickets = await SupportTicket.find({userId: req.query.userId}).sort({createdAt: -1}).lean();
    res.status(200).json(tickets);
  }
  catch(error){
    console.error('Error fetching tickets:', error);
    res.status(500).json({ 
      message: 'Error fetching student details',
      error: error.message 
    });
  }
});
router.post('/tickets', upload.single('uploadedFile'), async (req, res) => {
  //console.log('req.body from student:', req.body);
  try {
    const authHeader = req.headers.token || req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if(!token){
      token = req.cookies.token;
    }
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    const userType = decoded.role || decoded.type;

    if (!userId || !userType) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }
    
    let {
      title,
      subject,
      email,
      description,
      priority,
      status,
      category,
      userName,
      contact
    } = req.body;

    if (!title || !description) {
      if(!title){
        title = subject;
      }
      if(!title){
        return res.status(400).json({ error: 'Title and description are required.' });
      }
    }

    const newTicket = new SupportTicket({
      ticketId: uuidv4(),
      userId,
      userType:req.body.userType,
      email,
      user_name:userName,
      user_email:email,
      user_phone:contact,
      subject: title,
      description,
      priority,
      status: status || "open",
      category,
      secretCode: Math.floor(1000 + Math.random() * 9000),
      uploadedFile: req.file ? {
            data: req.file.buffer,
            contentType: req.file.mimetype,
            filename: req.file.originalname,
            size: req.file.size
          }
        : undefined
    });
    await newTicket.save();
    const assignedTicket = await assignTicketToSales(newTicket.ticketId);
    //console.log("assignedTicket:",assignedTicket);
    let autoMsg = `Your Ticket No. #${newTicket.ticketId} has been generated for [${newTicket.subject}]. Your issue will be resolved within 3–4 hours. Please use this secret code: ${newTicket.secretCode} to close your complaint after resolution.`;
    autoMsg += `\n\nYour ticket was assigned to ${assignedTicket.salesPerson}.`;
    
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
      to:email,
      subject:'Your Ticket has been raised',
      text: autoMsg,
    })
    
    res.status(201).json({ message: 'Support ticket created successfully', ticket: newTicket });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;
 