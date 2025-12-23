const Student = require('../models/Student');

// Helper: Validate email format
function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

const allowedFields = [
  "name", "email", "phone", "location", "title", "portfolioUrl", "githubUrl", "linkedinUrl", "careerObjective",
  "studentId", "rollNumber", "dateOfBirth", "gender", "nationality",
  "degree", "major", "year", "gpa", "cgpa", "expectedGraduation", "department", "batch", "joiningYear", "graduationYear",
  "skills", "programmingLanguages", "technologies", "projects", "achievements", "certifications",
  "extracurricular", "research", "hackathons", "resume", "profileImage"
];

// ✅ GET /me - get logged in student profile
exports.getOwnProfile = async (req, res) => {
  try {
    //console.log("req.user.id", req.user);
    const student = await Student.findById(req.user.id).select("-password").lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });
    //console.log("student debug 2:",student);
    if (student.profilePic) delete student.profilePic.data;
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ PUT /me - update logged in student's profile
exports.updateOwnProfile = async (req, res) => {
  try {
    const updates = {};
    for (let key of allowedFields) {
      if (req.body.hasOwnProperty(key)) {
        updates[key] = req.body[key];
      }
    }

    if (!updates.name || !updates.email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    if (!isValidEmail(updates.email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    delete updates.password; // don't allow password update here

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!student) return res.status(404).json({ message: 'Student not found' });

    delete student.password;
    if (student.profilePic) delete student.profilePic.data;

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ POST /me/profile-pic - upload profile picture
exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.profilePic = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };

    // Optionally clear external profile image URL
    if (student.profileImage) student.profileImage = undefined;

    await student.save();

    const studentObj = student.toObject();
    delete studentObj.password;
    if (studentObj.profilePic) delete studentObj.profilePic.data;

    res.json(studentObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET /me/profile-pic - serve profile picture or fallback
exports.getProfilePic = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (student && student.profilePic && student.profilePic.data) {
      res.set('Content-Type', student.profilePic.contentType || 'image/jpeg');
      return res.send(student.profilePic.data);
    }
    if (student && student.profileImage) {
      return res.redirect(student.profileImage);
    }

    // Default fallback image
    return res.redirect('https://plus.unsplash.com/premium_photo-1738637233381-6f857ce13eb9?w=400&auto=format&fit=crop&q=60');
  } catch (err) {
    res.status(500).send('Server error');
  }
};
