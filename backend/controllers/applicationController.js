const StudentApplication = require('../models/StudentApplication');
const Role = require('../models/Role');

// List student's applications
exports.listMyApplications = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: 'Not logged in' });
    const studentId = req.user.id;
    const applications = await StudentApplication.find({ student: studentId })
      .sort({ appliedDate: -1 })
      .populate('role')
      .populate('company');
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Apply to a role
exports.applyToJob = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }
    const studentId = req.user.id;
    const roleId = req.params.jobId; // jobId param is actually the role's _id
    const { coverLetter, experience, availability } = req.body;

    // Validate required fields
    if (!coverLetter || !experience || !availability) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Prevent duplicate applications
    const alreadyApplied = await StudentApplication.findOne({ student: studentId, role: roleId });
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied for this role.' });
    }

    // Find the role to get the company
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }

    // Create the student application
    const studentApp = new StudentApplication({
      student: studentId,
      role: roleId,
      company: role.companyId,
      coverLetter,
      experience,
      availability
    });
    //console.log("debug 2:",studentApp)
    await studentApp.save();
    

    // Increment applied count on Role
    await Role.findByIdAndUpdate(roleId, { $inc: { applied: 1 } });

    res.json({ success: true, message: 'Application submitted successfully.' });
  } catch (err) {
    console.error('Error in applyToJob:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};