const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Please login or provide a valid token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id) {
      req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    } else if (decoded.user && decoded.user.id) {
      req.user = { id: decoded.user.id, email: decoded.user.email, name: decoded.user.name };
    } else {
      return res.status(401).json({ message: 'Unauthorized: Token payload missing user id.' });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized: Token is not valid.' });
  }
};
