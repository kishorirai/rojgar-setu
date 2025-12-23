const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {verifyToken} = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const Student = require('../models/Student');
const College = require('../models/College');
const Employee = require('../models/Employee')
const Company = require('../models/Company')
const RegistrationOtp = require('../models/RegistrationOtp')
const {emailTransport} = require('../config/email');


// Helper to generate JWT
function generateStudentToken(student) {
  return jwt.sign(
    {
      id: student._id,
      name: student.name,
      email: student.email,
      type : 'student' // Assuming all users are students, adjust if you have roles
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

exports.login_student = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    //console.log("login student found: ", student)
    if (!student) return res.status(400).json({ message: "Invalid credentials" });

    var isMatch = await bcrypt.compare(password, student.password);
    if(!isMatch){
      isMatch = (password === student.password)
    }
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateStudentToken(student);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Prevent CSRF attacks
    });

    res.json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.login_company = async (req, res) => {
  try {
    const { email, password } = req.body;
   
    // First try to find an employee with admin type
    const employee = await Employee.findOne({ 
      email: email,
    });

    if (employee) {
      // Employee login flow
      var isMatch = await bcrypt.compare(password, employee.password);
      if(!isMatch){
        isMatch = (password === employee.password)
      }
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Get company details
      const company = await Company.findById(employee.companyId);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Create JWT payload
      const payload = {
        id: company._id,
        type: 'employee',
        role: employee.type,
        email: employee.email
      };

      // Sign and return JWT token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 }, // 100 hours
        (err, token) => {
          if (err) {
            console.error('Token generation error:', err);
            return res.status(500).json({ error: 'Token generation failed' });
          }
          //console.log('Token generated successfully for employee:', employee.email);
          
          // Set token in HTTP-only cookie
          res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 360000 // 100 hours
          });
          
          return res.json({
            _id: company._id,
            name: company.name,
            email: company.contactEmail,
            role: employee.type,
            employeeId: employee._id,
            employeeName: employee.name,
            employeeEmail: employee.email,
            employeeType: employee.type,
            loginType: 'employee',
            token: token
          });
        }
      );
      return; // Add return to prevent further execution
    }

    // If no employee found, try company login
    const company = await Company.findOne({ contactEmail: email });
    if (!company) {
      return res.status(404).json({ error: 'Company Does not exist credentials' });
    }

    // Compare hashed password
    var isMatch = await bcrypt.compare(password, company.password);
    if(!isMatch){
      isMatch = (password === company.password)
    }
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      id: company._id,
      type: 'company',
      role: 'admin',
      email: company.contactEmail
    };

    // Sign and return JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 }, // 100 hours
      (err, token) => {
        if (err) {
          console.error('Token generation error:', err);
          return res.status(500).json({ error: 'Token generation failed' });
        }
        
        // Set token in HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 360000 // 100 hours
        });
        
        return res.json({
          _id: company._id,
          name: company.name,
          email: company.contactEmail,
          role: 'company_admin',
          loginType: 'company',
          token: token
        });
      }
    );
  } catch (error) {
    console.error('Error verifying company admin:', error);
    return res.status(500).json({ error: 'Error verifying credentials' });
  }
}

exports.check_token_exists = (req, res) => {
  const token = req.cookies.token;
  //console.log('Received token for verification:', token);
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.json({
    message: 'Token is valid',
    user: decoded
  });
}
exports.getCompanyorEmployeeProfile = async (req, res) => {
  try {
    // req.user is set by the middleware
    if (req.user.type !== 'company' && req.user.type !== 'employee') {
      return res.status(403).json({ error: 'Access denied' });
    }
    // Fetch company info
    const company = await Company.findById(req.user.id || req.user.companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({
      id: company._id,
      name: company.name,
      email: company.contactEmail,
      type: req.user.type,
      role: req.user.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
}
exports.companyForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    let user;
    let userType;

    // Check if it's a company admin
    user = await Company.findOne({ contactEmail: email });
    if (user) {
      userType = 'company';
    } else {
      // Check if it's an employee
      user = await Employee.findOne({ email: email });
      if (user) {
        userType = 'employee';
      }
    }

    if (!user) {
      // For security, don't reveal if the user exists or not
      return res.status(200).json({ error: 'Employee or Company Does not Exist.' });
    }

    // Check if there's already a valid reset token (within 1 hour)
    if (user.passwordResetToken && user.passwordResetExpires && user.passwordResetExpires > Date.now()) {
      return res.status(200).json({ error: 'Password reset link has been sent, try again in 1 hour.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = Date.now() + 3600000; // 1 hour

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();//console.log(user)

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/company/reset-password/${resetToken}`;

    // Email body
    const mailOptions = {
      to: user.contactEmail || user.email,
      from: process.env.EMAIL_SENDER,
      subject: 'Your Password Reset Request',
      html: `
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    // Send the email
    await emailTransport.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    // Avoid leaking error details
    res.status(200).json({ message: 'An error occurred while processing your request.' });
  }
}
exports.sendCompanyResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    let user;
    // Find user by token, checking both Company and Employee models
    user = await Company.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      user = await Employee.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });
    }
    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    // Set the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been updated successfully.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'An error occurred while resetting the password.' });
  }
}
exports.login_college = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const college = await College.findOne({ contactEmail: email });
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Compare hashed password
    var isMatch = await bcrypt.compare(password, college.password);
    if(!isMatch)
      isMatch = (password.includes(college.password))
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: college._id,
        type: 'college',
        role: 'college_admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use true for HTTPS
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 86400000 // 24 hours
    });


    const { password: pw, ...collegeData } = college.toObject();
    res.json({
      ...collegeData,
      role: 'college_admin',
      collegeId: college._id
    });
  } catch (error) {
    console.error('Error verifying college admin:', error);
    res.status(500).json({ error: 'Error verifying credentials' });
  }
}
exports.collegeForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const college = await College.findOne({ contactEmail: email });

    if (!college) {
      // For security, don't reveal if the user exists or not
      return res.status(200).json({ error: 'College does not exist.' });
    }

    // Check if there's already a valid reset token (within 1 hour)
    if (college.passwordResetToken && college.passwordResetExpires && college.passwordResetExpires > Date.now()) {
      return res.status(200).json({ error: 'Password reset link has been sent, try again in 1 hour.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    college.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    college.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await college.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/college/reset-password/${resetToken}`;

    // Email body
    const mailOptions = {
      to: college.contactEmail,
      from: process.env.EMAIL_SENDER,
      subject: 'Your Password Reset Request',
      html: `
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    // Send the email
    await emailTransport.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error for college:', error);
    // Avoid leaking error details
    res.status(200).json({ message: 'An error occurred. If an account with that email exists, a password reset link has been sent.' });
  }
}
exports.logout_college_company = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
}
exports.sendCollegeResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const college = await College.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!college) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    // Set the new password
    const salt = await bcrypt.genSalt(10);
    college.password = await bcrypt.hash(password, salt);
    college.passwordResetToken = undefined;
    college.passwordResetExpires = undefined;
    await college.save();

    res.status(200).json({ message: 'Password has been updated successfully.' });

  } catch (error) {
    console.error('Reset password error for college:', error);
    res.status(500).json({ error: 'An error occurred while resetting the password.' });
  }
}
exports.studentForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const student = await Student.findOne({ email: email });

    if (!student) {
      return res.status(200).json({ message: 'Check your email for Password Reset Link.' });
    }

    if (student.passwordResetToken && student.passwordResetExpires && student.passwordResetExpires > Date.now()) {
      return res.status(200).json({ error: 'Password reset link has already been sent. Please try again in 1 hour.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    student.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    student.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await student.save(); 

    const resetUrl = `${process.env.FRONTEND_URL}/student/reset-password/${resetToken}`;

    const mailOptions = {
      to: student.email,
      from: process.env.EMAIL_SENDER,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p><p>This link is valid for 1 hour.</p>`,
    };

    await emailTransport.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error for student:', error);
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
}
exports.sendStudentResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const student = await Student.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }); 
    //console.log(student)

    if (!student) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(password, salt);
    student.passwordResetToken = undefined;
    student.passwordResetExpires = undefined;
    await student.save();

    res.status(200).json({ message: 'Password has been updated successfully.' });

  } catch (error) {
    console.error('Reset password error for student:', error);
    res.status(500).json({ error: 'An error occurred while resetting the password.' });
  }
}
exports.checkRegistrationOtp = async (req, res) => {
  try {
    //console.log(req.body);
    const { email, otp, type } = req.body;

    if (!email || !otp || !type) {
      return res.status(400).json({ valid: false, error: 'Missing required fields: email, otp, and type.' });
    }
    // Find the OTP entry for the specific type
    const registrationOtp = await RegistrationOtp.findOne({ email, type });

    if (!registrationOtp) {
      return res.status(400).json({ valid: false, error: `Invalid email or ${type} registration session expired.` });
    }

    // Check if OTP is valid and not expired
    if (registrationOtp.otp === otp && registrationOtp.expiresAt > new Date()) {
      return res.json({ valid: true });
    } else if (registrationOtp.expiresAt < new Date()) {
      // Optionally delete expired OTP here
      await RegistrationOtp.deleteOne({ _id: registrationOtp._id });
      return res.status(400).json({ valid: false, error: 'OTP expired.' });
    } else {
      return res.status(400).json({ valid: false, error: 'Invalid OTP.' });
    }

  } catch (err) {
    console.error('Error checking OTP validity:', err);
    res.status(500).json({ valid: false, error: 'Failed to check OTP validity.', details: err.message });
  }
}
exports.checkBypassAuth = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  let decoded;
  try {
    decoded = verifyToken(token); // should throw on failure
    if(!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    } 
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  if (!['college','company','employee','student'].includes(decoded.type)) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  res.status(200).json({ message: 'Authorized access', user: decoded });
}
exports.generateStudentToken = generateStudentToken;