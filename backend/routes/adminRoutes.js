const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { verifyAdminToken, requireAdmin } = require('../middleware/adminAuth');
const router = express.Router();
const cookieParser = require('cookie-parser');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const bcrypt = require('bcrypt');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.use(cookieParser());

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() }); //console.log("Admin found:", admin)

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    // Check if admin is active
    if (admin.status === 'inactive') {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Contact system administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin._id, 
        email: admin.email, 
        role: admin.role,
        permissions: admin.permissions 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: admin.getPublicProfile()
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Admin Profile (Protected route)
router.get('/profile', verifyAdminToken, async (req, res) => {
  try {
    res.json({
      success: true,
      admin: req.admin.getPublicProfile()
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get All Admin/Employee Data (Protected route - for Employee Management)
router.get('/employees', verifyAdminToken, async (req, res) => {
  try {

    // Fetch all admin/employee accounts
    const employees = await Admin.find({}).select('-password -resetPasswordToken -resetPasswordExpires').lean();
    
    // Transform data to match frontend expectations
    const transformedEmployees = employees.map((emp, index) => ({
      id: index + 1, // Frontend expects numeric IDs
      _id: emp._id, // Include MongoDB _id for API calls
      username: emp.username,
      email: emp.email,
      role: emp.role,
      status: emp.status,
      permissions: emp.permissions,
      phone: emp.phone,
      profileImage: emp.profileImage,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt
    }));

    res.json({
      success: true,
      employees: transformedEmployees
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Dashboard Stats (Protected route - both admin and employee can access)
router.get('/dashboard-stats', verifyAdminToken, async (req, res) => {
  try {
    // Import models for stats
    const College = require('../models/College');
    const Company = require('../models/Company');
    const Student = require('../models/Student');
    const Employee = require('../models/Employee');
    const CollegeApplication = require('../models/CollegeApplication');
    const Job = require('../models/Job');
    const Internship = require('../models/Internship');

    // Get counts
    const stats = await Promise.all([
      College.countDocuments(),
      Company.countDocuments(),
      Student.countDocuments(),
      Employee.countDocuments(),
      CollegeApplication.countDocuments(),
      Job.countDocuments(),
      Internship.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        colleges: stats[0],
        companies: stats[1],
        students: stats[2],
        employees: stats[3],
        applications: stats[4],
        jobs: stats[5],
        internships: stats[6]
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin-only routes (require admin role)
router.get('/admin-only-stats', verifyAdminToken, requireAdmin, async (req, res) => {
  try {
    // This route is only accessible by admin role
    res.json({
      success: true,
      message: 'Admin-only data accessed successfully',
      role: req.adminRole
    });
  } catch (error) {
    console.error('Admin-only stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update Admin Profile (Protected route)
router.put('/profile', verifyAdminToken, async (req, res) => {
  try {
    const { username, email, phone, currentPassword, newPassword } = req.body;
    const adminId = req.adminId;

    // Find the admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Update basic information
    if (username) admin.username = username;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;

    // Handle password change if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      admin.password = newPassword;
    }

    // Save the updated admin
    await admin.save();

    // Return updated admin data (without password)
    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: admin.getPublicProfile()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload Profile Image (Protected route)
router.post('/upload-profile-image', verifyAdminToken, upload.single('profileImage'), async (req, res) => {
  try {
    const adminId = req.adminId;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const uploadedFile = req.file;
    
    // Convert file buffer to base64 for Cloudinary
    const base64String = uploadedFile.buffer.toString('base64');
    const dataURI = `data:${uploadedFile.mimetype};base64,${base64String}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'admin_profiles',
      resource_type: 'auto',
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' }
      ]
    });

    // Update admin's profile image with Cloudinary URL
    admin.profileImage = result.secure_url;
    await admin.save();

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: result.secure_url
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Permission-based route example
router.get('/manage-colleges', verifyAdminToken, async (req, res) => {
  try {
    // This route requires 'manage_colleges' permission
    res.json({
      success: true,
      message: 'College management access granted',
      permission: 'manage_colleges'
    });
  } catch (error) {
    console.error('Manage colleges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update Employee Permissions (Protected route)
router.patch('/employees/:employeeId/permissions', verifyAdminToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { permissions } = req.body;

    // Check if user has permission to manage employees
    if (!req.adminPermissions.includes('Employee Management') && req.adminRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. Employee Management access required.'
      });
    }

    // Validate permissions array
    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be an array'
      });
    }

    // Find the employee
    const employee = await Admin.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Update permissions
    employee.permissions = permissions;
    await employee.save();

    res.json({
      success: true,
      message: 'Employee permissions updated successfully',
      employee: employee.getPublicProfile()
    });

  } catch (error) {
    console.error('Update employee permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete Employee (Protected route)
router.delete('/employees/:employeeId', verifyAdminToken, async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if user has permission to manage employees
    if (!req.adminPermissions.includes('Employee Management') && req.adminRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. Employee Management access required.'
      });
    }

    // Prevent admin from deleting themselves
    if (employeeId === req.adminId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Find the employee
    const employee = await Admin.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Delete the employee
    await Admin.findByIdAndDelete(employeeId);

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update employee status (active/inactive)
router.patch('/employees/:employeeId/status', verifyAdminToken, async (req, res) => {
  const { employeeId } = req.params;
  const { status } = req.body;
  const adminId = req.admin.id; // from verifyAdminToken

  // Validate status
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }
  
  // Prevent admin from deactivating their own account
  if (employeeId === adminId) {
      return res.status(403).json({ success: false, message: 'You cannot change your own status.' });
  }

  try {
    const employee = await Admin.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    employee.status = status;
    await employee.save({ validateModifiedOnly: true });

    // Exclude password from the returned object
    const employeeToReturn = employee.toObject();
    delete employeeToReturn.password;

    res.json({ success: true, message: 'Employee status updated successfully.', employee: employeeToReturn });

  } catch (error) {
    console.error('Update employee status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create a new Admin/Employee
router.post('/employees', verifyAdminToken, async (req, res) => {
  const { username, email, password, role } = req.body;

  // Basic validation
  if (!username || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Please provide username, email, password, and role' });
  }

  try {
    // Check if user already exists
    const existingUser = await Admin.findOne({ email }).lean();
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Admin with this Email already exists' });
    }

    // Create new admin - The plain password will be hashed by the pre-save hook in the Admin model
    const newAdmin = new Admin({
      username,
      email,
      password, // Pass the plain password
      role,
      permissions: [], // Default with no permissions
      status: 'active',
    });

    await newAdmin.save();

    // Don't send the password back
    const userToReturn = { ...newAdmin.toObject() };
    delete userToReturn.password;

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee: userToReturn
    });

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 