const crypto = require("crypto");
const nodemailer = require("nodemailer");
const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");
const { createStudentNotification, createCollegeNotification, createCompanyNotification } = require('../utils/notificationHelper');

// --- Real Email Setup (Gmail) ---
const {emailTransport} = require('../config/email');

/**
 * Send real email using Gmail
 */
async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_SENDER,
    to,
    subject,
    text,
  };
  await emailTransport.sendMail(mailOptions);
}

/**
 * Save portal notification in DB
 */
async function sendPortalNotification(userId, text) {
  try {
    // Create a system notification for the user
    await createStudentNotification(
      userId, 
      'Support Ticket Update', 
      text, 
      {
        type: 'info',
        category: 'system',
        senderModel: 'System'
      }
    );
  } catch (error) {
    console.error('Error creating portal notification:', error);
  }
}

function generateTicketId() {
  return (
    "TCK" +
    crypto.randomBytes(3).toString("hex").toUpperCase()
  );
}

function generateSecretCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Create support ticket with notification
 */
exports.createSupportTicket = async (req, res) => {
  try {
    const { userId, userType, user_name, user_email, user_phone, subject, description, category, priority, email, secretCode } = req.body;
    
    // Generate unique ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const supportTicket = new SupportTicket({
      ticketId,
      userId,
      userType,
      user_name,
      user_email,
      user_phone,
      subject,
      description,
      category,
      priority,
      email,
      secretCode,
      messages: [{
        sender: user_name,
        senderType: 'user',
        message: description,
        timestamp: new Date()
      }]
    });
    
    await supportTicket.save();
    
    // Create notification for the user
    try {
      if (userType === 'Student') {
        await createStudentNotification(
          userId,
          'Support Ticket Created',
          `Your support ticket "${subject}" has been created successfully. Ticket ID: ${ticketId}`,
          {
            type: 'success',
            category: 'system',
            actionUrl: `/support/ticket/${ticketId}`,
            actionText: 'View Ticket'
          }
        );
      } else if (userType === 'College') {
        await createCollegeNotification(
          userId,
          'Support Ticket Created',
          `Your support ticket "${subject}" has been created successfully. Ticket ID: ${ticketId}`,
          {
            type: 'success',
            category: 'system',
            actionUrl: `/support/ticket/${ticketId}`,
            actionText: 'View Ticket'
          }
        );
      } else if (userType === 'Company') {
        await createCompanyNotification(
          userId,
          'Support Ticket Created',
          `Your support ticket "${subject}" has been created successfully. Ticket ID: ${ticketId}`,
          {
            type: 'success',
            category: 'system',
            actionUrl: `/support/ticket/${ticketId}`,
            actionText: 'View Ticket'
          }
        );
      }
    } catch (notificationError) {
      console.error('Error creating support ticket notification:', notificationError);
      // Don't fail the ticket creation if notification fails
    }
    
    res.status(201).json({
      message: 'Support ticket created successfully',
      ticketId: supportTicket.ticketId,
      ticket: supportTicket
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Error creating support ticket' });
  }
};

// --- Get Tickets List for User ---
exports.getTickets = async (req, res) => {
  try{
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    const tickets = await SupportTicket.find({ userId }).sort({ createdAt: -1 });
    return res.json(tickets);
  }catch(err){
    console.error(err);
    return res.json({error:"failed to fetch tickets"});
  }
};

// --- Get Ticket Details by ticketId ---
exports.getTicketById = async (req, res) => {
  const { ticketId } = req.params;
  if (!ticketId) return res.status(400).json({ error: "Missing ticketId" });
  const ticket = await SupportTicket.findOne({ ticketId });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  res.json(ticket);
};

/**
 * Close support ticket with notification
 */
exports.closeTicket = async (req, res) => {
  try{
    const { ticketId, secretCode } = req.body;
    if (!ticketId || !secretCode) {
      return res.status(400).json({ error: "ticketId and secretCode required" });
    }
    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (ticket.secretCode && ticket.secretCode !== secretCode) {
      return res.status(401).json({ error: "Incorrect secret code" });
    }
    if (ticket.status === "closed" || ticket.status === "resolved") {
      return res.status(400).json({ error: "Ticket already closed/resolved" });
    }
    ticket.status = "resolved";
    ticket.closed = true;
    ticket.closedAt = new Date();
    await ticket.save();
    
    
    let actionUrl;
    if (req.body.recipientModel === 'College' || req.body.recipientModel === 'Company') {
      actionUrl = `/college/${req.body.userId}/support`;
    } else if (req.body.recipientModel === 'Student') {
      actionUrl = `/chat`;
    } else {
      actionUrl = null; 
    }
    await Notification.create({
      sender:req.body.userId,
      senderModel: req.body.senderModel,
      recipient:req.body.userId,
      recipientModel: req.body.recipientModel,
      title: req.body.title,
      message:req.body.message,
      actionUrl,
      actionText: 'Show Ticket',
      type: 'success',
      priority: 'normal',
    })
    await sendEmail(ticket.email, `Ticket #${ticket.ticketId} Closed`, `Your ticket #${ticket.ticketId} has been closed. Thank you!`);

    res.json({ message: "Ticket closed successfully" });
  }
  catch(err){
    console.log(err);
    res.status(500).json({error:"Failed to Create Ticket", err})
  }
};