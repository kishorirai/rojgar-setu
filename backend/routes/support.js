const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const { emailTransport } = require('../config/email');

// Support bot responses based on keywords
const botResponses = {
  // College-specific responses
  college: {
    'post job': {
      response: "To post a job as a college:\n1. Go to 'View Jobs' section\n2. Click 'Post New Job'\n3. Fill in job details (title, description, requirements)\n4. Set application deadline\n5. Submit the job posting\n\nStudents will be able to see and apply to your posted jobs.",
      category: 'technical'
    },
    'manage applications': {
      response: "To manage student applications:\n1. Navigate to 'Scheduled Applications'\n2. View all applications from students\n3. Click on any application to see student details\n4. You can approve, reject, or schedule interviews\n5. Track application status in real-time",
      category: 'technical'
    },
    'add students': {
      response: "To add students to your college:\n1. Go to 'Add Students' section\n2. You can add students individually or bulk upload\n3. Fill in student details (name, email, roll number)\n4. Students will receive login credentials\n5. They can then complete their profiles",
      category: 'technical'
    },
    'analytics': {
      response: "View placement analytics:\n1. Go to 'Placement Analysis' section\n2. See placement statistics and trends\n3. View student performance metrics\n4. Track company engagement\n5. Generate reports for insights",
      category: 'general'
    },
    'profile': {
      response: "To update student profiles:\n1. Students can edit their own profiles\n2. Go to student management section\n3. Click on any student to view/edit details\n4. Update academic information, skills, etc.\n5. Changes are reflected immediately",
      category: 'technical'
    }
  },
  
  // Company-specific responses
  company: {
    'post job': {
      response: "To post a job as a company:\n1. Go to 'Demand Roles' section\n2. Click 'Post New Role'\n3. Fill in role details (title, description, requirements)\n4. Set job type (full-time, internship)\n5. Submit the role posting\n\nColleges will be notified and students can apply.",
      category: 'technical'
    },
    'manage applications': {
      response: "To manage applications:\n1. Navigate to 'Applications' section\n2. View all applications from colleges\n3. Click on any application to see student details\n4. Schedule interviews or make hiring decisions\n5. Track application status and progress",
      category: 'technical'
    },
    'employees': {
      response: "To manage employees:\n1. Go to 'Manage Employees' section\n2. Add new employees to your company\n3. Assign roles and permissions\n4. View employee profiles and performance\n5. Manage team structure",
      category: 'technical'
    },
    'interviews': {
      response: "To schedule interviews:\n1. Go to 'Scheduled Interviews' section\n2. View upcoming interviews\n3. Schedule new interviews with candidates\n4. Set interview details (date, time, location)\n5. Send notifications to candidates",
      category: 'technical'
    },
    'analytics': {
      response: "View company analytics:\n1. Go to 'Placement Analysis' section\n2. See hiring statistics and trends\n3. View candidate performance metrics\n4. Track college partnerships\n5. Generate recruitment reports",
      category: 'general'
    }
  },
  
  // General responses
  general: {
    'help': {
      response: "I'm here to help! You can ask me about:\n• How to post jobs/roles\n• Managing applications\n• Adding students/employees\n• Viewing analytics\n• Profile management\n• Interview scheduling\n\nJust type your question and I'll provide detailed guidance!",
      category: 'general'
    },
    'contact': {
      response: "For additional support:\n• Email: support@campusadmin.com\n• Phone: +1-800-CAMPUS-ADMIN\n• Live chat: Available 24/7\n• Response time: Within 2 hours\n\nWe're here to help you succeed!",
      category: 'general'
    },
    'bug': {
      response: "If you've found a bug:\n1. Please describe the issue in detail\n2. Include steps to reproduce\n3. Mention your browser/device\n4. Add screenshots if possible\n\nWe'll investigate and fix it promptly!",
      category: 'bug_report'
    },
    'feature': {
      response: "Great idea! For feature requests:\n1. Describe the feature you need\n2. Explain how it would help\n3. Provide any examples\n4. We'll review and consider it\n\nWe love hearing from our users!",
      category: 'feature_request'
    }
  }
};

// Generate bot response based on user message
function generateBotResponse(userMessage, userType) {
  const message = userMessage.toLowerCase().replace(/[?.,!]/g, '').trim();
  
  // Helper function to check if message contains any of the keywords
  function containsKeyword(message, keywords) {
    return keywords.some(keyword => {
      const hasKeyword = message.includes(keyword);
      return hasKeyword;
    });
  }
  
  // Check college-specific responses
  if (userType === 'college') {
    for (const [keyword, response] of Object.entries(botResponses.college)) {
      if (containsKeyword(message, [keyword, ...keyword.split(' ')])) {
        return response;
      }
    }
  }
  
  // Check company-specific responses
  if (userType === 'company') {
    for (const [keyword, response] of Object.entries(botResponses.company)) {
      if (containsKeyword(message, [keyword, ...keyword.split(' ')])) {
        return response;
      }
    }
  }
  
  // Check general responses
  for (const [keyword, response] of Object.entries(botResponses.general)) {
    if (containsKeyword(message, [keyword, ...keyword.split(' ')])) {
      return response;
    }
  }
  
  // Default response if no keyword matches
  return {
    response: "I understand you're asking about: '" + userMessage + "'. Let me help you with that. Could you please provide more specific details about what you need help with? You can ask about posting jobs, managing applications, adding students/employees, viewing analytics, or any other platform features.",
    category: 'general'
  };
}

// Create a new support ticket
router.post('/tickets', async (req, res) => {
  try {
    const { userId, userType, subject, message } = req.body;
    
    if (!userId || !userType || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Generate ticket ID
    const ticketId = 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Generate bot response
    const botResponse = generateBotResponse(message, userType);
    
    const ticket = new SupportTicket({
      ticketId,
      userId,
      userType,
      subject,
      category: botResponse.category,
      messages: [
        {
          sender: userType === 'college' ? 'College Admin' : 'Company Admin',
          senderType: 'user',
          message: message,
          timestamp: new Date()
        },
        {
          sender: 'Support Bot',
          senderType: 'support_bot',
          message: botResponse.response,
          timestamp: new Date(),
          isBotResponse: true
        }
      ]
    });
    
    await ticket.save();
    
    res.status(201).json({
      success: true,
      ticket: ticket,
      message: 'Support ticket created successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating support ticket', error: error.message });
  }
});

// Get all tickets for a user
router.get('/tickets/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const tickets = await SupportTicket.find({ userId })
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      tickets: tickets
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets' });
  }
});

// Get a specific ticket
router.get('/tickets/:userId/:ticketId', async (req, res) => {
  try {
    const { userId, ticketId } = req.params;
    const ticket = await SupportTicket.findOne({ userId, ticketId });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json({
      success: true,
      ticket: ticket
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ticket' });
  }
});

// Add message to existing ticket
router.post('/tickets/:userId/:ticketId/messages', async (req, res) => {
  try {
    const { userId, ticketId } = req.params;
    const { message, userType } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    const ticket = await SupportTicket.findOne({ userId, ticketId });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Add user message
    ticket.messages.push({
      sender: userType === 'college' ? 'College Admin' : 'Company Admin',
      senderType: 'user',
      message: message,
      timestamp: new Date()
    });
    
    // Generate and add bot response
    const botResponse = generateBotResponse(message, userType);
    ticket.messages.push({
      sender: 'Support Bot',
      senderType: 'support_bot',
      message: botResponse.response,
      timestamp: new Date(),
      isBotResponse: true
    });
    
    ticket.status = 'in_progress';
    await ticket.save();
    
    res.json({
      success: true,
      ticket: ticket,
      message: 'Message added successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding message' });
  }
});

// Update ticket status
router.patch('/tickets/:userId/:ticketId/status', async (req, res) => {
  try {
    const { userId, ticketId } = req.params;
    const { status } = req.body;
    
    const ticket = await SupportTicket.findOne({ userId, ticketId });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    ticket.status = status;
    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
    }
    
    await ticket.save();
    
    res.json({
      success: true,
      ticket: ticket,
      message: 'Ticket status updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket status' });
  }
});

// Test endpoint for bot responses
router.get('/test-bot/:userType/:message', (req, res) => {
  const { userType, message } = req.params;
  const decodedMessage = decodeURIComponent(message);
  
  const response = generateBotResponse(decodedMessage, userType);
  
  res.json({
    success: true,
    userType,
    originalMessage: decodedMessage,
    botResponse: response
  });
});

// Get quick help topics
router.get('/quick-help/:userType', (req, res) => {
  const { userType } = req.params;
  
  const helpTopics = userType === 'college' ? [
    { title: 'How to post a job?', keywords: ['post job'] },
    { title: 'How to manage applications?', keywords: ['manage applications'] },
    { title: 'How to add students?', keywords: ['add students'] },
    { title: 'How to view analytics?', keywords: ['analytics'] },
    { title: 'How to update student profiles?', keywords: ['profile'] }
  ] : [
    { title: 'How to post a job?', keywords: ['post job'] },
    { title: 'How to manage applications?', keywords: ['manage applications'] },
    { title: 'How to manage employees?', keywords: ['employees'] },
    { title: 'How to schedule interviews?', keywords: ['interviews'] },
    { title: 'How to view analytics?', keywords: ['analytics'] }
  ];
  
  res.json({
    success: true,
    topics: helpTopics
  });
});

// Send support email
router.post('/email', async (req, res) => {
  const { to, subject, message } = req.body;
  if (!to || !subject || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to,
      subject,
      html: message
    });
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending support email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

module.exports = router; 