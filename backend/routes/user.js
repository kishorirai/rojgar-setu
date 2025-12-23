const express = require('express');
const router = express.Router();
const signup = require('../controllers/user/signup');
const login = require('../controllers/user/login');

router.post('/signup',signup);
router.post('/login',login);


module.exports = router;