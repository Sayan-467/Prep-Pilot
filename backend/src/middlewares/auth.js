const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'dev_secret';

module.exports = async function (req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = { id: user._id, email: user.email, name: user.name };
    next();
  } catch (err) {
    console.error('Auth error', err);
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};
