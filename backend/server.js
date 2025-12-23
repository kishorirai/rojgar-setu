require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');

// Importing the scheduler
const startTicketEscalationJob = require('./scheduler/scheduler');

// Route modules
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/user');
const placementRoutes = require('./routes/placement');
const companyRoutes = require('./routes/company');
const rolesRoutes = require('./routes/roles');
const employeesRoutes = require('./routes/employees');
const collegesRoutes = require('./routes/colleges');
const internshipsRoutes = require('./routes/internships');
const supportRoutes = require('./routes/support');
const studentMatchingRoutes = require('./routes/studentMatchingRoutes');
const supportTicketRoutes = require('./routes/support-ticket');
const bcrypt = require('bcrypt');
const Student = require('./models/Student');

//admin
const studentAdminRoutes = require('./routes/admin/studentAdminRoutes');
const signup = require('./controllers/user/signup');


// sales
const salesRoutes = require('./routes/sales'); // Assuming you have a sales route file

const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware for parsing JSON and urlencoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // Always true for HTTPS (Render)
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-site cookies over HTTPS
  },
}));

// CORS setup for Render/production: allow credentials and set allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
  'https://campusadmin-y4hh.vercel.app',
  'https://campusadmin.vercel.app',
  'https://www.rojgarsetu.org',
  'https://company.rojgarsetu.org',
  'https://payomatixpaymentgateway.onrender.com',
  'https://campusadmin.onrender.com', // Add Render backend itself if needed
];

if (process.env.REACT_URL) allowedOrigins.push(process.env.REACT_URL);
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowedOrigins = allowedOrigins.map(o => o.replace(/\/$/, ''));
    if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS not allowed for origin: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  optionsSuccessStatus: 200,
}));

app.use(helmet());

const Campus_INTERNAL_SECRET = process.env.CAMPUS_INTERNAL_SECRET;
if (!Campus_INTERNAL_SECRET) {
  console.error("Critical Error: CAMPUS_INTERNAL_SECRET is not set in environment variables.");
  process.exit(1);
}
console.log('Starting server initialization...');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  const formattedDate = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  console.log(`Connected to Database: ${process.env.MONGODB_URI} | ${formattedDate} | ${process.env.MONGODB_URI}`);
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', () => {
  console.log('MongoDB connection established successfully');
});

//additional routes that are not included here from routes folder
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/students', require('./routes/students'));
app.use('/api/tickets', require('./routes/supportTicketRoutes'));

// New REST endpoints
app.use('/api/auth', authRoutes); // for authentication-related endpoints (login/register)
app.use('/api/studentJobs', jobRoutes);
app.use('/api/kyc', require('./routes/kyc')); 
app.use('/api/internships', internshipsRoutes);
app.use('/api/studentInterviews', interviewRoutes);
app.use('/api/studentApplications', applicationRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/colleges', collegesRoutes);
app.use('/api/studentsProfile', studentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', supportTicketRoutes);


// admin routes

app.use('/api/admin', studentAdminRoutes);
app.use('/api/signup', signup);
app.use('/api/admin', require('./routes/admin/platformSettingsRoutes'));

//sales
app.use('/api/sales', salesRoutes);
// Make sure portfolioRoutes is properly loaded
const portfolioRoutes = require('./routes/portfolioRoutes');
app.use('/api/portfolio', portfolioRoutes);
// Log available routes for debugging
console.log('Portfolio routes registered:', portfolioRoutes.stack.map(r => r.route?.path).filter(Boolean));

// NEW: /api/student/me and /api/student/me/profile-pic endpoints
//     This route should implement: GET /api/student/me, PUT /api/student/me, POST /api/student/me/profile-pic, etc.
app.use('/api/student', studentRoutes); // <-- This must be after any /api/student/:something routes


// Health check/test route
app.get('/', (req, res) => {
  res.send('Backend running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Other Sales and Support routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/placement', placementRoutes);

// Add after other app.use for routes
app.use('/api/student-matching', studentMatchingRoutes);

//support-ticket routes
app.use('/api/support-ticket',supportTicketRoutes);

// Add the payment update route
app.use('/api/payment-update', require('./routes/paymentRoutes'));

startTicketEscalationJob(); // Start the ticket escalation job

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});