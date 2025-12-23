const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Login and basic info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rollNumber: { type: String }, // Optional for self-registration
  password: { type: String, required: true },

  // College relationship
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },

  // College info (optional for self-registration, can be filled later)
  department: String,
  batch: String,
  joiningYear: Number,
  graduationYear: Number,

  // Academic info
  degree: String,
  major: String,
  year: String,
  cgpa: { type: Number, min: 0, max: 10 },
  expectedGraduation: String,

  // Scores
  campusScore: { type: Number, min: 0, max: 10, default: 6.5 },

  // Career & job profile
  portfolioUrl: String,
  githubUrl: String,
  linkedinUrl: String,
  resume: String,

  // Contact
  phone: { type: String, required: false, unique: true },
  location: String,

  // Personal info
  dateOfBirth: String,
  gender: String,
  nationality: String,

  // Skills and technologies
  skills: [{ type: String, trim: true }],
  programmingLanguages: [String],
  technologies: [{type: String, trim: true}],

  // Projects
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    startDate: Date,
    endDate: Date,
    link: String
  }],

  // Achievements
  achievements: [{
    title: String,
    description: String,
    date: Date,
    issuer: String
  }],

  // Certifications
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    link: String
  }],

  // Extracurricular
  extracurricular: [{
    activity: String,
    role: String,
    achievement: String
  }],

  // Research
  research: [{
    title: String,
    role: String,
    year: Number,
    description: String
  }],

  // Hackathons
  hackathons: [{
    name: String,
    year: Number,
    achievement: String,
    description: String
  }],

  // Saved jobs (for job portal)
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

  // Profile picture (support both Buffer and fallback URL)
  profilePic: {
    data: Buffer,
    contentType: String,
  },
  salesId: {
    type: String,
    required: false,
    unique: true
  },
  profileImage: {
    type: String,
    default: 'https://plus.unsplash.com/premium_photo-1738637233381-6f857ce13eb9?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3R1ZGVudCUyMHByb2ZpbGUlMjBhbmltYXRlZHxlbnwwfHwwfHx8MA%3D%3D'
  },

  // Verifications
  verified: { type: Boolean, default: false },
  iskycVerified: { type: Boolean, default: false },
  isCollegeVerified: { type: Boolean, default: false },
  isSalesVerified: { type: Boolean, default: false },

  // Password reset fields
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  referralCode: { type: String, unique: true },

  // KYC fields
  kycStatus: { 
    type: String, 
    enum: ['requested','pending','approved', 'pending approval', 'verified', 'rejected', 'not started'], 
    default: 'not started',
    trim: true
  },
  kycData: {
    verificationId: { type: String, trim: true },
    accessToken: { type: String, trim: true },
    expiresInDays: { type: Number, min: 0 },
    status: { type: String, trim: true },
    digilockerUrl: { type: String, trim: true },
    lastUpdated: { type: String, trim: true }
  },
   documents: [{
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ['xii_marksheet', 'x_marksheet', 'aadhaar', 'pan', 'passport', 'other']
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'verified', 'rejected', 'missing'],
      default: 'pending'
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: () => ({})
    }
  }],

  // Payment fields (as an object)
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending'
    },
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    date: {
      type: Date
    },
    failureReason: {
      type: String
    }
  },

  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});



// Campus score calculation logic (from CollegeStudent)
studentSchema.pre('save', async function(next) {
  if (this.isModified('skills') || this.isModified('projects') || 
      this.isModified('achievements') || this.isModified('certifications') ||
      this.isModified('extracurricular') || this.isModified('research') || 
      this.isModified('hackathons') || this.isNew) {
    
    try {
      // Calculate scores from all feedback sources
      const [internships, jobs, interviews, reviews] = await Promise.all([
        mongoose.model('Internship').find({ studentId: this._id, 'feedback.overallScore': { $exists: true } }),
        mongoose.model('Job').find({ studentId: this._id, 'feedback.overallScore': { $exists: true } }),
        mongoose.model('Interview').find({ interviewee: this._id, 'feedback.overallScore': { $exists: true } }),
        mongoose.model('Review').find({ belongsTo: this._id, belongsToModel: 'Student', 'feedback.overallScore': { $exists: true } })
      ]);

      // Extract all valid scores
      const allScores = [
        ...internships.map(i => i.feedback.overallScore),
        ...jobs.map(j => j.feedback.overallScore),
        ...interviews.map(i => i.feedback.overallScore),
        ...reviews.map(r => r.feedback.overallScore)
      ].filter(score => typeof score === 'number' && score >= 0 && score <= 10);

      // Calculate new campus score (weighted average if needed)
      let newCampusScore;
      if (allScores.length > 0) {
        const sum = allScores.reduce((total, score) => total + score, 0);
        newCampusScore = sum / allScores.length;
        
        // Round to 2 decimal places
        newCampusScore = Math.round(newCampusScore * 100) / 100;
      } else {
        // Default score if no feedback exists
        newCampusScore = 6.5;
      }

      // Ensure score stays within bounds
      this.campusScore = Math.min(Math.max(newCampusScore, 0), 10);
      
    } catch (err) {
      console.error('Error calculating campus score:', err);
      // Keep existing score if calculation fails
    }
  }
  next();
});

// Get hook to find student by email
studentSchema.pre('findOne', async function(next) {
  const email = this.getQuery().email;
  if (email) {
    this.populate('email');
  }
  next();
});

// Post-update hooks for score recalculation
studentSchema.post(['findOneAndUpdate', 'updateOne', 'updateMany'], async function(result) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) await doc.save();
});


module.exports = mongoose.model('Student', studentSchema);