require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');

const startTicketEscalationJob = require('./scheduler/scheduler');

// Routes
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
const salesRoutes = require('./routes/sales');
const portfolioRoutes = require('./routes/portfolioRoutes');
const signup = require('./controllers/user/signup');
const studentAdminRoutes = require('./routes/admin/studentAdminRoutes');

const app = express();

/* =====================================================
   🔥 CORS — MUST BE FIRST (BEFORE sessions, helmet)
===================================================== */

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:8080',
      'https://campusadmin.vercel.app',
      'https://campusadmin-y4hh.vercel.app',
      'https://www.rojgarsetu.org',
      'https://company.rojgarsetu.org',
      'https://payomatixpaymentgateway.onrender.com',
      'https://rojgar-setu-2.onrender.com'
    ];

    // ✅ allow ALL Vercel preview deployments
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));

// ✅ Explicit preflight handling
app.options('*', cors());

/* =====================================================
   Middleware
===================================================== */

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    secure: true,              // HTTPS only (Render)
    httpOnly: true,
    sameSite: 'none',           // REQUIRED for Vercel → Render
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(helmet());

/* =====================================================
   Database
===================================================== */

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

/* =====================================================
   Routes
===================================================== */

app.use('/api/auth', authRoutes);
app.use('/api/studentJobs', jobRoutes);
app.use('/api/studentApplications', applicationRoutes);
app.use('/api/studentInterviews', interviewRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/colleges', collegesRoutes);
app.use('/api/internships', internshipsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/student-matching', studentMatchingRoutes);
app.use('/api/support-ticket', supportTicketRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.use('/api/student', studentRoutes);
app.use('/api/signup', signup);
app.use('/api/admin', studentAdminRoutes);

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/placement', placementRoutes);

/* =====================================================
   Health Check
===================================================== */

app.get('/', (req, res) => {
  res.send('Backend running!');
});

/* =====================================================
   Error Handler
===================================================== */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

/* =====================================================
   Start Server
===================================================== */

startTicketEscalationJob();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
