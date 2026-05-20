// ═══════════════════════════════════════════════════════════════
// middlewares/auth.js - JWT Authentication Middleware
// ═══════════════════════════════════════════════════════════════

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  } else if (req.body && req.body.token) {
    token = req.body.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, data: null, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    decoded.id = decoded.id || decoded.userId || decoded.sub;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, data: null, error: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };
