const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please sign in first.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}

function organizerOnly(req, res, next) {
  if (!['organizer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Organizer access required.' });
  }
  next();
}

module.exports = { auth, organizerOnly };
