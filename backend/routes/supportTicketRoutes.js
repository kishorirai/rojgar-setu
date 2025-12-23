const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportControlller");
const SupportTicket = require("../models/SupportTicket");

// Create a new support ticket
router.post("/", supportController.createSupportTicket);

// Get tickets for a user (user query param)
router.get("/", supportController.getTickets);
router.get('/student/:userId', async (req, res) => {
  console.log("req.params student", req.params);
  try {
    const tickets = await SupportTicket.find({ userId: req.params.userId, userType: 'Student' }).sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});
router.get('/company/:userId', async (req, res) => {
  console.log("req.params company", req.params, req.body);
  try {
    const tickets = await SupportTicket.find({ userId: req.params.userId, userType: 'Company' }).sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});
router.get('/college/:userId', async (req, res) => {
  console.log("req.params college", req.params);
  try {
    const tickets = await SupportTicket.find({ userId: req.params.userId, userType: 'College' }).sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Close a ticket
router.post("/close", supportController.closeTicket);

// Get details of a single ticket
router.get("/:ticketId", supportController.getTicketById);

module.exports = router;