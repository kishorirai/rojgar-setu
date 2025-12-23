const express = require('express');
const router = express.Router();
require('dotenv').config({path: '../.env'});
const { isCompanyAuthenticated } = require('../middleware/auth');
const RegistrationOtp = require('../models/RegistrationOtp');
const authController = require('../controllers/authController');


router.post('/student-login', authController.login_student);

router.post('/college-admin', authController.login_college);

router.post('/company-admin', authController.login_company);

router.post('/register/check-otp', authController.checkRegistrationOtp);
router.post('/logout', authController.logout_college_company);

// Add this test route
router.get('/verify-token', authController.check_token_exists);

router.get('/company/profile', isCompanyAuthenticated, authController.getCompanyorEmployeeProfile);

router.post('/company/forgot-password', authController.companyForgotPassword);

router.post('/company/reset-password/:token', authController.sendCompanyResetPasswordToken);

router.post('/college/forgot-password', authController.collegeForgotPassword);

router.post('/college/reset-password/:token', authController.sendCollegeResetPasswordToken);

router.post('/student/forgot-password', authController.studentForgotPassword);

router.post('/student/reset-password/:token', authController.sendStudentResetPasswordToken);


router.get('/check-bypass-auth', authController.checkBypassAuth); //or send them back to login page


module.exports = router;