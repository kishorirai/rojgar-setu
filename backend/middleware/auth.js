const jwt = require('jsonwebtoken');
require('dotenv').config({path: '../.env'});

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

// Middleware to check if user is authenticated via JWT in cookies

const isCollegeAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'college') {
      return res.status(403).json({ error: 'Access denied. College users only.' });
    }
    req.user = decoded;
    next();
  } catch (error) { 
    console.error('College authentication failed:', error.message);
    return res.status(401).json({ error: 'Unauthorized Access' });
  }
};

const isCollegeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.type !== 'college' || req.user.role !== 'college_admin') {
    return res.status(403).json({ error: 'Access denied. College admin only.' });
  }
  next();
};

const isCompanyAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'company' && decoded.type !== 'employee') {
      return res.status(403).json({ error: 'Access denied. Company users only.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Company authentication failed:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const isCompanyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.role !== 'admin' ) {
    return res.status(403).json({ error: 'Access denied. Company admin only.' });
  }
  next();
};

const isCompanyHR = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.type === 'employee') {
    return res.status(403).json({ error: 'Access denied. HR only.' });
  }
  next();
};

const isCompanyOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.type !== 'company') {
    return res.status(403).json({ error: 'Access denied. Company owner only.' });
  }
  next();
};

module.exports = {
  verifyToken,
  isCollegeAuthenticated,
  isCollegeAdmin,
  isCompanyAuthenticated,
  isCompanyAdmin,
  isCompanyHR,
  isCompanyOwner
}; 