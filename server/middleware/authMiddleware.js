// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (!user.rows[0]) return res.status(401).json({ message: 'User not found' });

    req.user = user.rows[0]; // ✅ This is key
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token failed', error: err.message });
  }
};

module.exports = protect;
