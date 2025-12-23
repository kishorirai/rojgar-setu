const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const authMiddleware = require('../middleware/authMiddleware')

// Generate portfolio route
router.get('/generate',authMiddleware, portfolioController.generatePortfolio);

module.exports = router;