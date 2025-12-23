const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Company = require('../models/Company');
const Role = require('../models/Role')
const Employee = require('../models/Employee');
const RegistrationOtp = require('../models/RegistrationOtp');
const Interview = require('../models/Interview');
const Application = require('../models/CollegeApplication');
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const {emailTransport,emailSender} = require('../config/email');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const {isCompanyAuthenticated,isCompanyHR,isCompanyAdmin,isCompanyOwner} = require('../middleware/auth');
const {isEmailDisposable} = require('../utils/disposableEmail');
const { createCompanyNotification } = require('../utils/notificationHelper');
//INDEX
// app.get('/api/company/auth') ..... company authentication
// app.get('/api/company/:companyid/roles') .....get roles by company Id  
// app.post('/api/company/:companyid/roles') .....post company roles  
// app.get('/api/company/:companyid') .....get company by company Id
// app.get('/api/company/applications/:companyid') .....get application by company id
// app.patch('/api/company/applications/:applicationid/status') .....patch status of application closed
// app.delete('/api/company/applications/:applicationid') .....delete application by application id 
// app.get('/api/company/roles') .....get all roles
// app.post('/api/company/roles') .....post company roles (jobs & internships)
// app.put('/api/company/roles/:id') .....put roles by roles Id
// app.delete('/api/company/roles/:id') .....delete roles by roles id
// app.post('/api/company/register/initiate') ......Post, Initiate company registration: send OTP
// app.post('/api/company/register/verify') .....post Verify OTP and and set password during company registration
// app.post('/api/company/:companyid/employees') .....post Add employee to company (supports both company admin and employee addition)
// app.get('/api/company/:companyid/applications/complete') .....get Optimized endpoint for company applications with all related data
// app.get('/api/company/:companyid/interviews/complete') .....Optimized endpoint for company scheduled interviews with all related data
assignTicketToSales = async(ticketID) =>{
  freeSales = await User.findOne({}).sort({workload:1});
  const ticket = await SupportTicket.findOne({ ticketId: ticketID });
  if (!ticketID) throw new Error("Ticket ID is required");
  ticket.assignedTo = freeSales.email; 
  ticket.salesPerson = freeSales.firstName + " " + freeSales.lastName; // Store the sales person's ID
  await ticket.save();
  freeSales.workload += 1; // Increment the workload of the sales person
  await freeSales.save();
  //console.log(`Assigned ticket ${ticketID} to ${freeSales.email}`);
  return ticket;
}

router.post('/auth',  async (req, res) => {
  const { email, password } = req.body;
  try {
    const company = await Company.findOne({ contactEmail: email });
    if (!company || password !== company.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({
      _id: company._id,
      name: company.name,
      email: company.contactEmail,
      role: 'company_admin'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying credentials' });
  }
});

router.get('/:companyId/roles',isCompanyAuthenticated, async (req, res) => {
  try {
    const roles = await Role.find({ companyId: req.params.companyId })
      .populate('companyId', 'name')
      .sort({ createdAt: -1 }); 
       res.json(roles);  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/:companyId/roles',isCompanyAuthenticated,isCompanyAdmin, async (req, res) => {
  try {
    const {companyId} = req.params;
    var role = {...req.body,companyId:companyId.toString()};
    role = new Role(role);
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get('/:companyId',isCompanyAuthenticated, async (req, res) => {
  try { 
    const company = await Company.findById(req.params.companyId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
});

router.get('/applications/:companyId',isCompanyAuthenticated, async (req, res) => {
  try {
    const applications = await Application.find({ applicationTo: req.params.companyId })
      .populate('applicationFrom', 'name')
      .populate('roleId', 'jobTitle')
      .populate('studentIds', 'name email');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.patch('/applications/:applicationId/status',isCompanyAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

router.delete('/applications/:applicationId',isCompanyAuthenticated,async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

router.get('/roles',isCompanyAuthenticated, async (req, res) => {
  try {
    const roles = await Role.find().populate('companyId', 'name').sort({ createdAt: -1 });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/roles',isCompanyAuthenticated,isCompanyAdmin, async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.put('/roles/:id',isCompanyAuthenticated,isCompanyAdmin, async (req, res) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(updatedRole);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/roles/:id',isCompanyAuthenticated,isCompanyAdmin, async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/register/initiate', async (req, res) => {
  try {
    const {
      name,
      type,
      industry,
      website,
      location,
      contactEmail,
      contactPhone,
      adminContact,
      companySize,
      foundedYear,
      description,
      referralCode
    } = req.body;

    // Validate required fields
    if (!name || !contactEmail || !contactPhone) {
      return res.status(400).json({ error: 'Missing required company fields.' });
    }
    if (isEmailDisposable(contactEmail)) {
      return res.status(400).json({ error: 'Disposable email addresses are not allowed.' });
    }
    // Check for duplicate company name or email
    const existingCompany = await Company.findOne({ $or: [ { name }, { contactEmail } ] });
    if (existingCompany) {
      return res.status(409).json({ error: 'Company with this name or email already exists.' });
    }

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Remove any previous OTP for this email and type
    await RegistrationOtp.deleteMany({ email: contactEmail, type: 'company' });

    // Store OTP and company info
    const otpData = await RegistrationOtp.create({
      email: contactEmail,
      otp,
      expiresAt,
      type: 'company', // Specify the type of registration
      data: { // Store the company info
        name:name,
        type:type,
        industry:industry,
        website:website,
        location:location,
        contactEmail:contactEmail,
        contactPhone:contactPhone,
        adminContact:adminContact,
        companySize:companySize,
        foundedYear:foundedYear,
        description:description,
        referralCode:referralCode
      }
    });
    //console.log('OTP for company registration:', otpData);

    // Send OTP email
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: contactEmail,
      subject: 'Your Company Registration OTP',
      text: `Your OTP for company registration is: ${otp}\nThis OTP is valid for 5 minutes.`
    });

    res.json({ message: 'OTP sent to company contact email.' });

  } catch (err) {
    console.error('Error initiating company registration:', err);
    res.status(500).json({ error: 'Failed to initiate company registration', details: err.message });
  }
});
router.post('/register/verify', async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Missing required fields: email, otp, password, and confirm password.' });
    }

    // Find the OTP entry for company registration
    const registrationOtp = await RegistrationOtp.findOne({ email, type: 'company' });

    if (!registrationOtp) {
      return res.status(400).json({ error: 'Invalid email or company registration session expired.' });
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

    // Create the company using stored info and hashed password
    const companyInfo = registrationOtp.data; // Get company info from the generic data field
    const newCompany = new Company({
      ...companyInfo,
      type:'',
      password: hashedPassword, // Use the hashed password
      verificationStatus: 'unverified' // Set initial verification status
    });
    //console.log('Creating new company with info:', newCompany);

    await newCompany.save();

    // Delete the used OTP entry
    await RegistrationOtp.deleteOne({ _id: registrationOtp._id });

    // Create welcome notification for the new company
    try {
      await createCompanyNotification(
        newCompany._id,
        'Welcome to Campus Admin! 🏢',
        `Welcome ${newCompany.name}! Start posting jobs, finding talented students, and building your team. Your company dashboard is ready.`,
        {
          type: 'success',
          category: 'general',
          actionUrl: `/company/${newCompany._id}/dashboard`,
          actionText: 'View Dashboard',
          priority: 'high'
        }
      );

      // Create a feature introduction notification
      await createCompanyNotification(
        newCompany._id,
        'Start Hiring Today',
        'Post your first job, browse student profiles, and discover how our platform can help you find the perfect candidates.',
        {
          type: 'info',
          category: 'system',
          actionUrl: `/company/${newCompany._id}/post-job`,
          actionText: 'Post Jobs',
          priority: 'normal'
        }
      );
      //create a manage employee
      await createCompanyNotification(
        newCompany._id,
        'Add Your Employees',
        'Manage Your Employees, you can add remove or update Admin, Employee, HR for your company',
        {
          type: 'info',
          category: 'system',
          actionUrl: `/company/${newCompany._id}/employees`,
          actionText: 'Post Jobs',
          priority: 'normal'
        }
      );

    } catch (notificationError) {
      console.error('Error creating welcome notifications for company:', notificationError);
      // Don't fail registration if notification creation fails
    }

    // Prepare response (exclude password)
    const { password: pw, ...companyData } = newCompany.toObject();
    res.status(201).json({ message: 'Company registered successfully!', company: companyData });

  } catch (err) {
    console.error('Error verifying OTP and registering company:', err);
    res.status(500).json({ error: 'Failed to complete company registration', details: err.message });
  }
});

router.post('/:companyId/employees',isCompanyAuthenticated,isCompanyAdmin, async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      name,
      email,
      phone,
      department,
      type = 'employee', // Default type is employee
      password,
      addedBy // ID of the employee/company adding this employee
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !department || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check for duplicate employee email
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(409).json({ error: 'Employee with this email already exists' });
    }

    // Validate employee type
    if (!['employee', 'hr', 'admin'].includes(type)) {
      return res.status(400).json({ error: 'Invalid employee type' });
    }

    // If addedBy is provided, verify the adding entity has permission
    if (addedBy) {
      // Check if addedBy is an employee
      const addingEmployee = await Employee.findById(addedBy);
      if (addingEmployee) {
        // Verify the employee belongs to the same company
        if (addingEmployee.companyId.toString() !== companyId) {
          return res.status(403).json({ error: 'Unauthorized to add employees to this company' });
        }
        // Only admin and hr can add employees
        if (!['admin', 'hr'].includes(addingEmployee.type)) {
          return res.status(403).json({ error: 'Only admin and HR can add employees' });
        }
      } else {
        // Check if addedBy is the company itself
        const addingCompany = await Company.findById(addedBy);
        if (!addingCompany || addingCompany._id.toString() !== companyId) {
          return res.status(403).json({ error: 'Unauthorized to add employees' });
        }
      }
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new employee
    const employee = new Employee({
      name,
      email,
      phone,
      department,
      type,
      companyId,
      password: hashedPassword,
      verified: true, // Since this is added by authorized personnel
      addedBy: addedBy || companyId // Track who added this employee
    });

    await employee.save();

    // Send welcome email to employee
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'Welcome to ' + company.name,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to ${company.name}!</h2>
          <p>Dear ${name},</p>
          <p>Your employee account has been created successfully.</p>
          <p><strong>Your login details:</strong></p>
          <ul>
            <li>Email: ${email}</li>
            <li>Password: ${password}</li>
          </ul>
          <p>Please login and change your password for security reasons.</p>
          <p>Best regards,<br>${company.name} Team</p>
        </div>
      `
    });

    // Return employee data without password
    const { password: pw, ...employeeData } = employee.toObject();
    res.status(201).json({
      message: 'Employee added successfully',
      employee: employeeData
    });

  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'Failed to add employee', details: error.message });
  }
});
router.get('/:companyId/applications/complete',isCompanyAuthenticated, async (req, res) => {
  try {
    const { companyId } = req.params;

    // Get company data
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get all applications with populated student data in a single query
    const applications = await Application.aggregate([
      { $match: { applicationToCompany: new mongoose.Types.ObjectId(companyId),status:'active' } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'colleges',
          localField: 'applicationFromCollege',
          foreignField: '_id',
          as: 'collegeDetails'
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'students.studentId',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $lookup: {
          from: 'internships',
          localField: 'studentDetails._id',
          foreignField: 'studentId',
          as: 'internships'
        }
      },
      {
        $lookup: {
          from: 'interviews',
          localField: 'studentDetails._id',
          foreignField: 'interviewee',
          as: 'interviews'
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'studentDetails._id',
          foreignField: 'studentId',
          as: 'jobs'
        }
      },
      {
        $addFields: {
          collegeName: { $arrayElemAt: ['$collegeDetails.name', 0] }, // Add college name
          students: {
            $map: {
              input: '$students',
              as: 'student',
              in: {
                $mergeObjects: [
                  '$$student',
                  {
                    studentId: {
                      $let: {
                        vars: {
                          studentDetail: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$studentDetails',
                                  as: 'sd',
                                  cond: { $eq: ['$$sd._id', '$$student.studentId'] }
                                }
                              },
                              0
                            ]
                          }
                        },
                        in: {
                          $mergeObjects: [
                            '$$studentDetail',
                            {
                              internships: {
                                $filter: {
                                  input: '$internships',
                                  as: 'internship',
                                  cond: { $eq: ['$$internship.studentId', '$$student.studentId'] }
                                }
                              },
                              interview_scheduled: {
                                $filter: {
                                  input: '$interviews',
                                  as: 'interview',
                                  cond: { $eq: ['$$interview.interviewee', '$$student.studentId'] }
                                }
                              },
                              jobs: {
                                $filter: {
                                  input: '$jobs',
                                  as: 'job',
                                  cond: { $eq: ['$$job.studentId', '$$student.studentId'] }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          studentDetails: 0,
          internships: 0,
          interviews: 0,
          jobs: 0,
          collegeDetails: 0 // Remove collegeDetails after extracting the name
        }
      }
    ]);

    res.json({applications});
  } catch (error) {
    console.error('Error in applications endpoint:', error);
    res.status(500).json({ message: 'Error fetching applications data', error: error.message });
  }
});

router.get('/:companyId/interviews/complete',isCompanyAuthenticated, async (req, res) => {
  try {
    const { companyId } = req.params;

    // Get company data
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get all interviews with populated data in a single query
    const interviews = await Interview.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: 'students',
          localField: 'interviewee',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'interviewer',
          foreignField: '_id',
          as: 'interviewerDetails'
        }
      },
      {
        $lookup: {
          from: 'applications',
          localField: 'applicationId',
          foreignField: '_id',
          as: 'applicationDetails'
        }
      },
      {
        $addFields: {
          studentDetails: { $arrayElemAt: ['$studentDetails', 0] },
          interviewer: { $arrayElemAt: ['$interviewerDetails', 0] },
          applicationDetails: { $arrayElemAt: ['$applicationDetails', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          candidateName: 1,
          role: 1,
          date: 1,
          status: 1,
          link: 1,
          zoomLink: 1,
          zoomMeetingId: 1,
          zoomPassword: 1,
          notes: 1,
          feedback: 1,
          isDone: 1,
          interviewer: {
            _id: 1,
            name: 1,
            email: 1,
            position: 1
          },
          studentDetails: {
            _id: 1,
            name: 1,
            email: 1,
            rollNumber: 1,
            department: 1,
            batch: 1,
            cgpa: 1,
            skills: 1,
            resume: 1,
            campusScore: 1
          }
        }
      }
    ]);

    res.json({ company, interviews });
  } catch (error) {
    console.error('Error in interviews endpoint:', error);
    res.status(500).json({ message: 'Error fetching interviews data', error: error.message });
  }
});

// POST /api/company/tickets
router.post('/tickets', async (req, res) => {
  try {
    //console.log("req.body:",req.body)
    const { userId, userType, subject, description, category, priority, email,contact, userName} = req.body;
    if (!userId || !userType || !subject || !description || !email) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const newTicket = new SupportTicket({
      ticketId: uuidv4(),
      userId,
      userType: userType || 'Company',
      subject,
      description,
      category,
      priority,
      user_name:userName,
      user_phone:contact,
      email,
      user_email:email,
      secretCode: Math.floor(1000 + Math.random() * 9000),
      status: 'open'
    });
    //console.log("new Ticket form company:", newTicket);
    await newTicket.save();
    const assignedTicket = await assignTicketToSales(newTicket.ticketId);
    let autoMsg = `Your Ticket No. #${newTicket.ticketId} has been generated for [${newTicket.subject}]. Your issue will be resolved within 3–4 hours. Please use this secret code: ${newTicket.secretCode} to close your complaint after resolution.`;
    autoMsg += `\n\nYour ticket was assigned to ${assignedTicket.salesPerson}.`;

    await Notification.create({
      sender:userId,
      senderModel: 'Company',
      recipient:userId,
      recipientModel: 'Company',
      title: "Your issue has been raised",
      category:'system',
      actionUrl: `/company/${userId}/support`,
      actionText: 'Show Ticket',
      message:autoMsg,
      type: 'info',
      priority: 'normal',
    })

    await emailTransport.sendMail({
      from:emailSender,
      to:email,
      subject:'Your Ticket has been raised',
      text: autoMsg,
    })

    res.status(201).json({ message: 'Support ticket created successfully', ticket: newTicket });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Edit company information
router.put('/:id/edit',isCompanyAuthenticated,isCompanyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      industry,
      website,
      location,
      contactEmail,
      contactPhone,
      adminContact,
      companySize,
      foundedYear,
      description,
      profileImage
    } = req.body;

    // Check if this is an image-only update
    if (Object.keys(req.body).length === 1 && req.body.profileImage) {
      try {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(profileImage, {
          folder: 'company_profiles',
          resource_type: 'auto'
        });

        // Update company with new image URL
        const company = await Company.findByIdAndUpdate(
          id,
          { profileImage: result.secure_url },
          { new: true }
        ).select('-password');

        if (!company) {
          return res.status(404).json({ error: 'Company not found' });
        }

        return res.json(company);
      } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }

    // Validate required fields for full profile update
    if (!name || !type || !industry || !location || !contactEmail || !contactPhone || 
        !adminContact?.name || !adminContact?.email || !adminContact?.phone || !adminContact?.designation ||
        !companySize || !foundedYear || !description) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if company exists
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check for duplicate company name or email
    const existingCompany = await Company.findOne({
      $and: [
        { _id: { $ne: id } },
        { $or: [{ name }, { contactEmail }] }
      ]
    });

    if (existingCompany) {
      return res.status(400).json({ error: 'Company name or email already exists' });
    }

    // Update company information
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      {
        name,
        type,
        industry,
        website,
        location,
        contactEmail,
        contactPhone,
        adminContact,
        companySize,
        foundedYear,
        description
      },
      { new: true }
    ).select('-password');

    res.json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company information' });
  }
});

module.exports = router;