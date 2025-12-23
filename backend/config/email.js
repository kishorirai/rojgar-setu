const nodemailer = require('nodemailer');
module.exports.emailTransport = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@rojgarsetu.org',
    pass: 'l%llxEs5'
  }
});

module.exports.emailSender = 'noreply@rojgarsetu.org';
