const Student = require('../../models/Student');
const College = require('../../models/College');
const Company = require('../../models/Company');
const User = require('../../models/User');
const { emailTransport, emailSender } = require('../../config/email');
const SupportTicket = require('../../models/SupportTicket');
const ManagerTicket = require('../../models/manager_ticket'); // Import your manager ticket model
const jwt = require('jsonwebtoken');

const DEFAULT_PASSWORD = "Campus@123";

// Helper to get salesId from userName
async function getSalesIdByUserName(userName) {
  // Split userName into firstName and lastName
  const [firstName, ...rest] = userName.trim().split(" ");
  const lastName = rest.join(" ");
  const user = await User.findOne({ firstName, lastName });
  return user ? user._id : null; // Use _id as salesId
}
function generateOnboardingEmail(fullname, username, password) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f7f9fc; padding: 30px;">
      <h2>Welcome to Rojgar Setu!</h2>
      <p>Hi ${fullname},</p>
      <p>Here are your login details:</p>
      <div style="background-color: #eaf0f7; padding: 15px; border-radius: 6px;">
        <strong>Username:</strong> ${username}<br>
        <strong>Password:</strong> ${password}
      </div>
      <p>Login here: <a href="https://www.rojgarsetu.org">https://www.rojgarsetu.org</a></p>
      <p>Please change your password after your first login.</p>
      <p><br/><br/>Warm regards!<br/>Team Rojagar Setu </p>
    </div>
  `;
}

exports.addStudent = async (req, res) => {
  console.log("Adding student with body:", req.body);
  try {
    const { name, email, password} = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const authHeader = req.headers['authorization']; // or req.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing or malformed' });
    }
    const token = authHeader.split(' ')[1]; // Get the token after "Bearer"
    console.log("Token:", token);
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    const salesId = decoded.salesId;
    if (!salesId) {
      return res.status(404).json({ message: "Sales ID not found for this user." });
    }
    console.log("Body:", req.body);
    console.log("Decoded Sales ID:", salesId);

    await emailTransport.sendMail({
      from: emailSender,
      to: email,
      subject: 'Your Student Account Credentials',
      html: generateOnboardingEmail(name, email, password)
    });
      
    const student = new Student({ name, email, password, salesId }); 
    await student.save();


    res.status(201).json({ message: "Student added successfully", student });
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.addCollege = async (req, res) => {
  // console.log("Adding college with body:", req.body);
  // console.log("Headers:", req.headers);
  try {
    const { name, code, contactEmail, contactPhone} = req.body;
    if (!name || !code || !contactEmail || !contactPhone) {
      return res.status(400).json({ message: "All fields are required." });
    }
    
    const authHeader = req.headers['authorization']; // or req.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing or malformed' });
    }
    const token = authHeader.split(' ')[1]; // Get the token after "Bearer"
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    const salesId = decoded.salesId;
    if (!salesId) {
      return res.status(404).json({ message: "Sales ID not found for this user." });
    }

    const college = new College({
      name,
      code,
      contactEmail,
      contactPhone,
      password: DEFAULT_PASSWORD,
      salesId
    });
    await college.save();

    await emailTransport.sendMail({
      from: emailSender,
      to: contactEmail,
      subject: 'Your College Account Credentials',
      html: generateOnboardingEmail(name, contactEmail, DEFAULT_PASSWORD)
    });

    res.status(201).json({ message: "College added successfully", college });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
    console.log("Error adding college:", error);
  }
};

exports.addCompany = async (req, res) => {
  try {
    const { name, contactEmail, contactPhone} = req.body;
    if (!name || !contactEmail || !contactPhone) {
      return res.status(400).json({ message: "All fields are required." });
    }
    
    const authHeader = req.headers['authorization']; // or req.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing or malformed' });
    }
    const token = authHeader.split(' ')[1]; // Get the token after "Bearer"
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    const salesId = decoded.salesId;
    if (!salesId) {
      return res.status(404).json({ message: "Sales ID not found for this user." });
    }

    const company = new Company({
      name,
      contactEmail,
      contactPhone,
      password: DEFAULT_PASSWORD,
      salesId
    });
    await company.save();

    await emailTransport.sendMail({
      from: emailSender,
      to: contactEmail,
      subject: 'Your Company Account Credentials',
      html: generateOnboardingEmail(name, contactEmail, DEFAULT_PASSWORD)
    });

    res.status(201).json({ message: "Company added successfully", company });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch students for this salesId
exports.getStudentsBySales = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1]; // Get the token after "Bearer"
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    const salesId = decoded.salesId;
    if (!salesId) return res.status(400).json({ message: "Sales ID not found for this user." });
    const students = await Student.find({ salesId });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch colleges for this salesId
exports.getCollegesBySales = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1]; // Get the token after "Bearer"
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    const salesId = decoded.salesId;
    if (!salesId) return res.status(404).json({ message: "Sales ID not found for this user." });
    const colleges = await College.find({ salesId });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch companies for this salesId
exports.getCompaniesBySales = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1]; // Get the token after "Bearer"
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    const salesId = decoded.salesId;
    if (!salesId) return res.status(404).json({ message: "Sales ID not found for this user." });
    const companies = await Company.find({ salesId });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getSupportTicketsBySales = async (req, res) => {
  try {
    const { userName } = req.query;
    if (!userName) return res.status(400).json({ message: "userName is required" });
    const salesId = await getSalesIdByUserName(userName);
    if (!salesId) return res.status(404).json({ message: "Sales ID not found for this user." });

    // Find all tickets for colleges/companies with this salesId
    const colleges = await College.find({ salesId });
    const companies = await Company.find({ salesId });

    const collegeIds = colleges.map(c => c._id.toString());
    const companyIds = companies.map(c => c._id.toString());

    // Find tickets for these users, EXCLUDING escalatedToManager:true
    const tickets = await SupportTicket.find({
      $or: [
        { userType: 'college', userType:'College', userId: { $in: collegeIds } },
        { userType: 'company', userType:'Company', userId: { $in: companyIds } }
      ],
      escalatedToManager: { $ne: true }
    }).lean();

    // Attach email and phone to each ticket
    const collegeMap = {};
    colleges.forEach(c => { collegeMap[c._id] = c; });
    const companyMap = {};
    companies.forEach(c => { companyMap[c._id] = c; });

    const ticketsWithContact = tickets.map(ticket => {
      let email = "";
      let phone = "";
      if ((ticket.userType === "college" || ticket.userType === "College") && collegeMap[ticket.userId]) {
        email = collegeMap[ticket.userId].contactEmail;
        phone = collegeMap[ticket.userId].contactPhone;
      }
      if ((ticket.userType === "company" || ticket.userType === "Company") && companyMap[ticket.userId]) {
        email = companyMap[ticket.userId].contactEmail;
        phone = companyMap[ticket.userId].contactPhone;
      }
      return { ...ticket, email, phone };
    });

    res.json(ticketsWithContact);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getManagerSupportTickets = async (req, res) => {
  try {
    // You can add filters if needed, for now fetch all manager tickets
    const tickets = await ManagerTicket.find().lean();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


//   try {
//     // Fetch all colleges and companies
//     const colleges = await College.find();
//     const companies = await Company.find();

//     const collegeMap = {};
//     colleges.forEach(c => { collegeMap[c._id] = c; });
//     const companyMap = {};
//     companies.forEach(c => { companyMap[c._id] = c; });

//     // Fetch all tickets
//     const tickets = await SupportTicket.find().lean();

//     // Attach email and phone to each ticket
//     const ticketsWithContact = tickets.map(ticket => {
//       let email = "";
//       let phone = "";
//       if (ticket.userType === "college" && collegeMap[ticket.userId]) {
//         email = collegeMap[ticket.userId].contactEmail;
//         phone = collegeMap[ticket.userId].contactPhone;
//       }
//       if (ticket.userType === "company" && companyMap[ticket.userId]) {
//         email = companyMap[ticket.userId].contactEmail;
//         phone = companyMap[ticket.userId].contactPhone;
//       }
//       return { ...ticket, email, phone };
//     });

//     res.json(ticketsWithContact);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

exports.updateTicketEvaluation = async (req, res) => {
  try {
    const { ticketId, evaluation } = req.body;
    const ticket = await SupportTicket.findOneAndUpdate(
      { ticketId: ticketId },
      { evaluation },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.markTicketResolved = async (req, res) => {
  try {
    const { ticketId, secretCode } = req.body;
    let ticket = await SupportTicket.findOne({ ticketId: ticketId });
    if(!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (secretCode !== ticket.secretCode) {
      return res.status(403).json({ message: "Invalid secret code" });
    }
    ticket.status = "resolved";
    ticket.closed = true;
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.assignTicketToSales = async(req,res) =>{
  freeSales = await User.findOne({}).sort({workload:1});
  if(!freeSales) return res.status(404).json({ message: "No available sales representative" });

  const { ticketID } = req.body;
  const ticket = await SupportTicket.findOne({ ticketId: ticketID });
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  const fullname_salesID = freeSales.firstName + " " + freeSales.lastName + "-" + freeSales.salesId
  ticket.assignedTo = fullname_salesID; // 

  ticket.salesPerson = freeSales.firstName + " " + freeSales.lastName; // Store the sales person's ID
  await ticket.save();

  freeSales.IsFree = false; // Mark this sales rep as busy
  await freeSales.save();
  res.json({ message: "Ticket assigned successfully", ticket });
}

exports.getSupportTicketsByUserID = async(req, res) => {
    try {
    const authHeader = req.headers.token || req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    const decoded = jwt.verify(token, process.env.SESSION_SECRET);

    const mail = decoded.email || decoded.contactEmail;

    
    const tickets = await SupportTicket.find({  $or: [
    { user_email: mail },
    { assignedTo: mail }
  ]}).sort({createdAt: -1}).lean();

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


