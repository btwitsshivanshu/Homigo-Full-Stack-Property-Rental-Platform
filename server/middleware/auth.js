const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

function signToken(user) {
  return jwt.sign(
    { sub: user._id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized: Token missing' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username, email: payload.email, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { signToken, verifyJWT, requireRole };

// Require KYC verified owner for protected operations
module.exports.requireKycVerifiedOwner = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Forbidden: owners only' });
    }
    const user = await User.findById(req.user.id).select('kycStatus');
    if (!user || user.kycStatus !== 'verified') {
      return res.status(403).json({ message: 'Owner KYC required. Please verify your Aadhaar.' });
    }
    next();
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Internal server error' });
  }
};
