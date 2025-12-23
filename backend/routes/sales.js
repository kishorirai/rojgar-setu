const express = require('express');
const router = express.Router();
const { addStudent, addCollege, addCompany,getCollegesBySales,getStudentsBySales, getCompaniesBySales, getSupportTicketsBySales , getSupportTicketsByUserID} = require('../controllers/sales/salesController');
const auth = require('../middleware/auth'); // Your JWT middleware

const controller = require('../controllers/sales/salesController');
// console.log(controller);
// console.log({ addStudent, addCollege, addCompany });

router.post('/student' ,addStudent);
router.post('/college', addCollege);
router.post('/company', addCompany);

router.get('/students', getStudentsBySales);
router.get('/colleges', getCollegesBySales);
router.get('/companies', getCompaniesBySales);
router.get('/support-tickets', getSupportTicketsBySales);
router.get('/userId-support-tickets', getSupportTicketsByUserID);

router.post('/ticket/evaluation', require('../controllers/sales/salesController').updateTicketEvaluation);
router.post('/ticket/resolve', require('../controllers/sales/salesController').markTicketResolved);
router.get('/manager-support-tickets', require('../controllers/sales/salesController').getManagerSupportTickets);

router.put('/assign',require('../controllers/sales/salesController').assignTicketToSales);
module.exports = router;