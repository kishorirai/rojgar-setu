const express = require('express');
const router = express.Router();
const { getAllStudents } = require('../../controllers/admin/studentController');
const { getAllColleges } = require('../../controllers/admin/studentController');
const { getAllCompanies } = require('../../controllers/admin/studentController');
const { getUserDetails } = require('../../controllers/admin/studentController');
const {getStudentCount} = require('../../controllers/admin/studentController');
const {getCollegeCount} = require('../../controllers/admin/studentController');
const {getCompanyCount} = require('../../controllers/admin/studentController');
const { getRecentActivity } = require('../../controllers/admin/studentController');
const { getAllSupportTickets } = require('../../controllers/admin/studentController');
const { getAllTransactions } = require('../../controllers/admin/studentController');

router.get('/students', getAllStudents);
router.get('/colleges', getAllColleges);
router.get('/companies', getAllCompanies);
router.get('/user', getUserDetails);
router.get('/student-count', getStudentCount);
router.get('/college-count', getCollegeCount);
router.get('/company-count', getCompanyCount);
router.get('/recent-activity', getRecentActivity);
router.get('/allsupport-tickets', getAllSupportTickets);

router.get('/transactions', getAllTransactions);


module.exports = router;
