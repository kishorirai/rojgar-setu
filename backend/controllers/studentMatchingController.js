const Role = require('../models/Role');
const Student = require('../models/Student');

/**
 * Get matching students for a specific demand role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMatchingStudents = async (req, res) => {
  try {
    const { roleId } = req.params;
    // Validate roleId
    if (!roleId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Role ID is required' 
      });
    }

    // Find the role to get required skills
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ 
        success: false, 
        message: 'Role not found' 
      });
    }

    // Extract query parameters for optional filters
    const { minScore } = req.query;
    // First, let's check if we can find any students at all
    const totalStudents = await Student.countDocuments();
    // Find all students first
    const allStudents = await Student.find()
      .select('name email profileImage skills projects achievements campusScore')
      .limit(100);

    // Calculate match percentage for each student
    const studentsWithMatchPercentage = allStudents.map(student => {
      // Convert all skills to lowercase for case-insensitive comparison
      const studentSkills = student.skills.map(s => s.toLowerCase());
      const roleSkills = role.skills.map(s => s.toLowerCase());
      // Find matching skills
      const matchingSkills = studentSkills.filter(skill => 
        roleSkills.includes(skill)
      );
      // Calculate match percentage
      const matchPercentage = (matchingSkills.length / roleSkills.length) * 100;
      return {
        ...student.toObject(),
        matchPercentage: Math.round(matchPercentage),
        matchingSkills: student.skills.filter(skill => 
          roleSkills.includes(skill.toLowerCase())
        )
      };
    });

    // Filter students based on minimum score if provided
    let filteredStudents = studentsWithMatchPercentage;
    if (minScore) {
      filteredStudents = filteredStudents.filter(student => 
        student.campusScore >= parseFloat(minScore)
      );
    }

    // Sort students by match percentage and campus score
    const sortedStudents = filteredStudents
      .filter(student => student.matchingSkills.length > 0)
      .sort((a, b) => {
        // First sort by number of matching skills
        if (b.matchingSkills.length !== a.matchingSkills.length) {
          return b.matchingSkills.length - a.matchingSkills.length;
        }
        // Then by match percentage
        if (b.matchPercentage !== a.matchPercentage) {
          return b.matchPercentage - a.matchPercentage;
        }
        // Finally by campus score
        return b.campusScore - a.campusScore;
      })
      .slice(0, 50);

    // Return the matching students
    res.json({
      success: true,
      role: {
        id: role._id,
        title: role.jobTitle,
        skills: role.skills
      },
      matchCount: sortedStudents.length,
      students: sortedStudents
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error finding matching students', 
      error: err.message 
    });
  }
};

/**
 * Get matching students for all roles of a company
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCompanyRolesWithMatches = async (req, res) => {
  try {
    const { companyId } = req.params;
    // Validate companyId
    if (!companyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company ID is required' 
      });
    }

    // Find all active roles for the company
    const roles = await Role.find({ 
      companyId, 
      status: 'active' 
    });

    if (!roles || roles.length === 0) {
      return res.json({
        success: true,
        message: 'No active roles found for this company',
        roles: []
      });
    }

    // Extract query parameters for optional filters
    const { minScore } = req.query;
    // Process each role to find matching students
    const rolesWithMatches = await Promise.all(roles.map(async (role) => {
      // Build the query for this role
      const query = {
        skills: { $in: role.skills }
      };
      // Add optional filters if provided - removing location filter
      if (minScore) {
        query.campusScore = { $gte: parseFloat(minScore) };
      }
      // Find matching students for this role
      const matchingStudents = await Student.find(query)
        .select('name email profileImage skills projects achievements campusScore')
        .limit(20); // Limit per role to prevent excessive results
      return {
        role: {
          id: role._id,
          title: role.jobTitle,
          skills: role.skills,
          location: role.location,
          jobType: role.jobType,
          stipend: role.stipend,
          numberOfStudents: role.numberOfStudents,
          description: role.description
        },
        matchCount: matchingStudents.length,
        students: matchingStudents
      };
    }));

    // Return all roles with their matching students
    res.json({
      success: true,
      companyId,
      roleCount: roles.length,
      roles: rolesWithMatches
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error finding matching students for company roles', 
      error: err.message 
    });
  }
}; 