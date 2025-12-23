const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee'); 
const {isCompanyAuthenticated,isCompanyHR,isCompanyOwner,isCompanyAdmin} = require('../middleware/auth');
// app.post('/api/employees/register') .....Post, company registers his employee
// app.post('/api/employees/login') .....Post, employee login to company
// app.get('/api/employees') ..... needs to be fixed to app.get('/api/employee/company/:companyId')
// app.put('/api/employees/:id) .... put, employee is updated by the company
// app.delete('api/employee/:id/company/:companyId/') .....Delete employee from company
// app.post('/api/employee/register/initiate') .....Post, Initiate employee registration: send OTP
// app.post('/api/employee/register/verify') .....Post, Verify OTP and create Password during registration

router.post('/register', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee' });
  }
});


router.get('/', isCompanyAuthenticated, async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ error: 'companyId required' });
  const employees = await Employee.find({ companyId})
  res.json(employees);
});

router.put('/:id', isCompanyAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    //console.log(req.body)

    const employee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Return employee data without password
    const { password: pw, ...employeeData } = employee.toObject();
    res.json(employeeData);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

router.delete('/:id/company/:companyId/',isCompanyAuthenticated,isCompanyAdmin, async (req, res) => {
  try {
    const { companyId, id } = req.params;
    // Find and delete the employee by ID and companyId
    const deletedEmployee = await Employee.findOneAndDelete({
      _id: id,
      companyId: companyId
    });

    if (!deletedEmployee) {
      return res.status(404).json({ error: 'Employee not found or does not belong to the specified company' });
    }

    res.json({ message: 'Employee deleted successfully', employee: deletedEmployee });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});
router.post('/api/employee/register/initiate', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      position,
      companyId
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !department || !position || !companyId) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    // Check for duplicate employee email
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(409).json({ error: 'Employee with this email already exists.' });
    }

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Remove any previous OTP for this email and type
    await RegistrationOtp.deleteMany({ email, type: 'employee' });

    // Store OTP and employee info
    await RegistrationOtp.create({
      email,
      otp,
      expiresAt,
      type: 'employee',
      data: {
        name,
        email,
        phone,
        department,
        position,
        companyId
      }
    });

    // Send OTP email
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'Your Employee Registration OTP',
      text: `Your OTP for employee registration is: ${otp}\nThis OTP is valid for 5 minutes.`
    });

    res.json({ message: 'OTP sent to employee email.' });

  } catch (err) {
    console.error('Error initiating employee registration:', err);
    res.status(500).json({ error: 'Failed to initiate employee registration', details: err.message });
  }
});

router.post('/api/employee/register/verify', async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Missing required fields: email, otp, password, and confirm password.' });
    }

    // Find the OTP entry for employee registration
    const registrationOtp = await RegistrationOtp.findOne({ email, type: 'employee' });

    if (!registrationOtp) {
      return res.status(400).json({ error: 'Invalid email or employee registration session expired.' });
    }

    // Check if OTP is valid and not expired
    if (registrationOtp.otp !== otp || registrationOtp.expiresAt < new Date()) {
      // Optionally delete the invalid/expired OTP
      await RegistrationOtp.deleteOne({ _id: registrationOtp._id });
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Validate password and confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and confirm password do not match.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the employee using stored info and hashed password
    const employeeInfo = registrationOtp.data;
    const newEmployee = new Employee({
      ...employeeInfo,
      password: hashedPassword,
      type: 'employee' // Set default type
    });

    await newEmployee.save();

    // Delete the used OTP entry
    await RegistrationOtp.deleteOne({ _id: registrationOtp._id });

    // Prepare response (exclude password)
    const { password: pw, ...employeeData } = newEmployee.toObject();
    res.status(201).json({ message: 'Employee registered successfully!', employee: employeeData });

  } catch (err) {
    console.error('Error verifying OTP and registering employee:', err);
    res.status(500).json({ error: 'Failed to complete employee registration', details: err.message });
  }
});

module.exports = router;