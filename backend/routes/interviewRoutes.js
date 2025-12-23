const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/my', authMiddleware, interviewController.getMyInterviews);
router.patch('/:id/progress', authMiddleware, interviewController.updatePreparationProgress);
router.get('/scheduled', interviewController.getScheduledInterviews);

module.exports = router;
