const Job = require('../models/Job');
const Application = require('../models/Application');
const Feedback = require('../models/Feedback');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

exports.getDashboardData = async (req, res) => {
  try {
    if (!req.cookies) {
      return res.status(401).json({ message: 'Unauthorized: No session user' });
    }
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    if (!decoded || !decoded.type) {
      return res.status(401).json({ message: 'Unauthorized: Invalid session' });
    }
    const userId = decoded.id;
    // Opportunities
    const totalOpportunities = await Job.countDocuments();
    const savedOpportunities = await Job.countDocuments({ savedBy: userId });

    // Status definitions (UI aligned)
    const statusDefs = [
      { status: "Applied", color: "blue" },
      { status: "Under Review", color: "yellow" },
      { status: "Interview", color: "purple" },
      { status: "Offered", color: "green" },
      { status: "Rejected", color: "red" },
      { status: "Withdrawn", color: "gray" }
    ];
    // Map DB statuses to UI statuses
    const dbToUiStatus = {
      "Applied": "Applied",
      "Under Review": "Under Review",
      "Interview Scheduled": "Interview",
      "Interview": "Interview",
      "Offer Received": "Offered",
      "Offered": "Offered",
      "Rejected": "Rejected",
      "Withdrawn": "Withdrawn"
    };

    // Applications overview
    const applicationsOverview = [];
    for (const { status, color } of statusDefs) {
      const possibleDbStatuses = Object.entries(dbToUiStatus)
        .filter(([db, ui]) => ui === status)
        .map(([db]) => db);

      const count = await Application.countDocuments({
        student: userId,
        status: { $in: possibleDbStatuses }
      });
      if (count > 0) applicationsOverview.push({ status, count, color });
    }

    // Fetch real notifications from database
    console.log('Dashboard: Fetching notifications for userId:', userId);
    
    // TEMPORARY: Get student by ID first to get email, then fetch notifications
    const studentForNotifications = await Student.findById(userId).lean();
    console.log('Dashboard: Found student:', studentForNotifications ? studentForNotifications.email : 'Not found');
    
    let notifications = [];
    if (studentForNotifications) {
      // Use the same logic as the test endpoint
      notifications = await Notification.find({
        recipient: studentForNotifications._id,
        recipientModel: 'Student'
      })
      .populate('sender', 'name email contactEmail')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    }

    console.log('Dashboard: Found notifications:', notifications.length);
    notifications.forEach((notification, index) => {
      console.log(`Dashboard: Notification ${index + 1}: ${notification.title}`);
    });

    // Transform notifications to match frontend expected format
    const notificationsList = notifications.map(notification => ({
      id: notification._id,
      date: new Date(notification.createdAt).toLocaleDateString(),
      text: notification.message,
      title: notification.title,
      type: notification.type,
      category: notification.category,
      read: notification.read,
      sender: notification.sender ? notification.sender.name || notification.sender.email : 'System',
      actionUrl: notification.actionUrl,
      actionText: notification.actionText
    }));

    console.log('Dashboard: Transformed notificationsList length:', notificationsList.length);

    // Recent feedback (ensure your Feedback model has student, company, title, rating, message/feedback, date)
    const recentFeedback = await Feedback.find({ student: userId })
      .sort({ date: -1 })
      .limit(4)
      .lean();

    // Interview schedule
    const interviewApplications = await Application.find({
      student: userId,
      status: { $in: ["Interview Scheduled", "Interview"] },
      interviewDate: { $gte: new Date() }
    })
      .sort({ interviewDate: 1 })
      .limit(3)
      .populate('job')
      .lean();

    const interviewSchedule = interviewApplications.map(app => ({
      id: app._id,
      company: app.job?.company || "",
      title: app.job?.title || "",
      date: app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : "",
      time: app.interviewDate ? new Date(app.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
    }));

    // Student basic info
    const student = await Student.findById(userId).lean();

    // Profile completion logic
    let profileCompletion = 0;
    if (student) {
      if (student.name) profileCompletion += 20;
      if (student.email) profileCompletion += 20;
      if ((student.programmingLanguages && student.programmingLanguages.length) || (student.skills && student.skills.length)) profileCompletion += 20;
      if (student.resume) profileCompletion += 20;
      if ((student.experience && student.experience.length) || (student.workExperience && student.workExperience.length)) profileCompletion += 20;
      if (profileCompletion > 100) profileCompletion = 100;
    }

    res.json({
      student: student ? { name: student.name, email: student.email } : {},
      profileCompletion,
      opportunitiesOverview: { total: totalOpportunities, saved: savedOpportunities },
      applicationsOverview,
      kycStatus:student.kycStatus,
      notificationsList,
      recentFeedback: recentFeedback.map(fb => ({
        _id: fb._id,
        company: fb.company,
        title: fb.title || "",
        rating: fb.rating || 0,
        comment: fb.message || fb.feedback || "",
        date: fb.date ? new Date(fb.date).toLocaleDateString() : "",
      })),
      interviewSchedule
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: 'Dashboard data fetch failed' });
  }
}; 