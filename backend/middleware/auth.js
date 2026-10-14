const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_grocery_pos_jwt_key_2026';

/**
 * Middleware to authenticate requests using JWT Bearer Token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired authentication token.' });
    }
    req.user = user;
    next();
  });
}

/**
 * Middleware to enforce role-based access control (e.g. Admin only)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.map(r => r.toLowerCase()).includes((req.user.role || '').toLowerCase())) {
      return res.status(403).json({ 
        error: `Access forbidden. Requires one of roles: [${allowedRoles.join(', ')}]` 
      });
    }
    next();
  };
}

/**
 * Helper to generate signed JWT token for authenticated staff
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

module.exports = {
  authenticateToken,
  requireRole,
  generateToken,
  JWT_SECRET
};
