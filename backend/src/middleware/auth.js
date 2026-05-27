import { verifyAccessToken } from '../utils/token.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive or suspended.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid token.',
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail - user remains undefined
  }
  next();
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};
