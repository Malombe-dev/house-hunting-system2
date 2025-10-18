// server/src/middleware/auth.js (COMPLETE & ALIGNED)
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // CRITICAL FIX: Support both 'id' and 'userId' in token
      const userId = decoded.userId || decoded.id;

      // Get user from token
      req.user = await User.findById(userId).select('-password');

      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'User no longer exists'
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'User account has been deactivated'
        });
      }

      // CRITICAL: Check if user must change password (except for password change routes)
      if (req.user.mustChangePassword && !req.path.includes('/change-password')) {
        return res.status(403).json({
          status: 'error',
          message: 'Password change required',
          mustChangePassword: true,
          redirectTo: '/change-password'
        });
      }

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token expired, please login again'
        });
      }
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional authentication - don't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId || decoded.id;
        req.user = await User.findById(userId).select('-password');
      } catch (err) {
        // Token invalid, but that's okay for optional auth
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};