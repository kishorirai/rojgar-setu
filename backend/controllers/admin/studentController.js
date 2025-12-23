const Student = require('../../models/Student');
const College = require('../../models/College');
const Company = require('../../models/Company');
const User = require('../../models/User'); 
const SupportTicket = require('../../models/SupportTicket'); // Assuming this model exists
const moment = require('moment'); // Ensure moment is installed and required
const Transaction = require('../../models/Transaction');
// GET all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('college', 'name');

    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const code = student.salesId || student.referralCode;
        const salesUser = code ? await User.findOne({ salesId: code }) : null;

        return {
          ...student.toObject(),
          salesPerson: salesUser
            ? { firstName: salesUser.firstName, lastName: salesUser.lastName }
            : null,
        };
      })
    );

    res.status(200).json({ success: true, data: enrichedStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching students' });
  }
};

// GET all colleges
exports.getAllColleges = async (req, res) => {
  try {
    const colleges = await College.find();

    const enrichedColleges = await Promise.all(
      colleges.map(async (college) => {
        const code = college.salesId || college.referralCode;
        const salesUser = code ? await User.findOne({ salesId: code }) : null;

        return {
          ...college.toObject(),
          salesPerson: salesUser
            ? { firstName: salesUser.firstName, lastName: salesUser.lastName }
            : null,
        };
      })
    );

    res.status(200).json({ success: true, data: enrichedColleges });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching colleges' });
  }
};

// GET all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();

    const enrichedCompanies = await Promise.all(
      companies.map(async (company) => {
        const code = company.salesId || company.referralCode;
        const salesUser = code ? await User.findOne({ salesId: code }) : null;

        return {
          ...company.toObject(),
          salesPerson: salesUser
            ? { firstName: salesUser.firstName, lastName: salesUser.lastName }
            : null,
        };
      })
    );

    res.status(200).json({ success: true, data: enrichedCompanies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching companies' });
  }
};

// Get student count only
exports.getStudentCount = async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching student count:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching student count' });
  }
};

// Get college count only
exports.getCollegeCount = async (req, res) => {
  try {
    const count = await College.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching college count:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching college count' });
  }
};

// Get company count only
exports.getCompanyCount = async (req, res) => {
  try {
    const count = await Company.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching company count:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching company count' });
  }
};

// fetch details from user
exports.getUserDetails = async (req, res, next) => {
  try {
    // Fetch all users from the database
    const users = await User.find().select("-password"); // Exclude password field
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Group users by salesId
    const grouped = {};
    users.forEach(user => {
      const salesId = user.salesId || "Unassigned";
      if (!grouped[salesId]) grouped[salesId] = [];
      grouped[salesId].push(user);
    });

    // Add counts for each group
    const result = {};
    Object.entries(grouped).forEach(([salesId, groupUsers]) => {
      result[salesId] = {
        users: groupUsers,
        studentCount: groupUsers.filter(u => u.type === "Student").length,
        collegeCount: groupUsers.filter(u => u.type === "College").length,
        companyCount: groupUsers.filter(u => u.type === "Company").length,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error while fetching users" });
    next(error);
  }
};


exports.getRecentActivity = async (req, res) => {
  try {
    const oneDayAgo = moment().subtract(1, 'days').toDate();

    const recentStudents = await Student.find({ createdAt: { $gte: oneDayAgo } });
    const recentColleges = await College.find({ createdAt: { $gte: oneDayAgo } });
    const recentCompanies = await Company.find({ createdAt: { $gte: oneDayAgo } });
    const recentSupportTickets = await SupportTicket.find({ createdAt: { $gte: oneDayAgo } });

    res.status(200).json({
      success: true,
      students: recentStudents,
      colleges: recentColleges,
      companies: recentCompanies,
      supportTickets: recentSupportTickets,
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent activity' });
  }
};


// GET all support tickets
// GET all support tickets
exports.getAllSupportTickets = async (req, res) => {
  try {
    // Fetch all support tickets and select specific fields
    const supportTickets = await SupportTicket.find().select('ticketId userId subject priority status updatedAt assignedTo user_name userType salesPerson').sort({ updatedAt: -1 } );

    // Map the results to include the desired field names
    const formattedTickets = supportTickets.map(ticket => ({
      ticketId: ticket.ticketId,
      user: ticket.user_name, // Assuming userId is the field representing the user
      subject: ticket.subject,
      priority: ticket.priority,
      status: ticket.status,
      updated: ticket.updatedAt,
      assignedTo: ticket.assignedTo || 'Unassigned', // Default to 'Unassigned' if no assignee
      userType : ticket.userType || 'Unknown', // Default to 'Unknown' if userType is not set
      salesPerson: ticket.salesPerson || ' ' // Default to 'Not Assigned' if salesPerson is not set
    }));

    res.status(200).json({ success: true, data: formattedTickets });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching support tickets' });
  }
};




exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ data: transactions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error });
  }
};