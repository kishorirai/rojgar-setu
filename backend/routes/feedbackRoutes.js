const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

// Student gives feedback
router.post('/give', authMiddleware, feedbackController.giveFeedback);

// Student fetches feedback received
router.get('/received', authMiddleware, feedbackController.getReceivedFeedback);

// Student fetches feedback given
router.get('/given', authMiddleware, feedbackController.getGivenFeedback);

// Get feedback statistics
router.get('/stats', authMiddleware, feedbackController.getFeedbackStats);

// Edit feedback (PATCH)
router.patch('/given/:id', authMiddleware, feedbackController.editFeedback);

// Delete feedback (DELETE)
router.delete('/given/:id', authMiddleware, feedbackController.deleteFeedback);

module.exports = router;