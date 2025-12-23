const express = require('express');
const router = express.Router();
const studentMatchingController = require('../controllers/studentMatchingController');
const authMiddleware = require('../middleware/authMiddleware');

// Get matching students for a specific role
router.get('/roles/:roleId/matches', authMiddleware, studentMatchingController.getMatchingStudents);

// Get all roles with matching students for a company
router.get('/company/:companyId/roles-with-matches', authMiddleware, studentMatchingController.getCompanyRolesWithMatches);

module.exports = router; 