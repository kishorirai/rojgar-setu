const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware')

// These routes assume you have session-based auth, e.g., Passport.js

router.get('/my', authMiddleware , applicationController.listMyApplications);
router.post('/:jobId/apply', authMiddleware, applicationController.applyToJob);

module.exports = router;