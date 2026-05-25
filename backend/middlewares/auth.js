/**
 * Authentication Middleware
 * JWT verification and user authentication
 */

import { verifyAccessToken, isTokenExpired } from '../utils/jwt.js';
import User from '../models/User.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

// Verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: ERROR_MESSAGES.TOKEN_EXPIRED,
        timestamp: new Date().toISOString(),
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        statusCode: HTTP_STATUS.FORBIDDEN,
        message:
          user.status === 'suspended'
            ? ERROR_MESSAGES.USER_SUSPENDED
            : ERROR_MESSAGES.USER_DELETED,
        timestamp: new Date().toISOString(),
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: ERROR_MESSAGES.INVALID_TOKEN,
      timestamp: new Date().toISOString(),
    });
  }
};

// Verify specific role
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: ERROR_MESSAGES.FORBIDDEN,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

// Verify farmer role
export const farmerOnly = authorize('farmer');

// Verify officer role
export const officerOnly = authorize('officer');

// Verify admin role
export const adminOnly = authorize('admin');

// Verify farmer or officer
export const farmerOrOfficer = authorize('farmer', 'officer');

// Check if user owns resource
export const checkResourceOwnership = (resourceField = 'farmerId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      });
    }

    const resourceUserId = req.body[resourceField] || req.params[resourceField];
    const userId = req.user._id.toString();

    // Allow access if user is owner or admin
    if (resourceUserId && resourceUserId !== userId && req.user.role !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: ERROR_MESSAGES.FORBIDDEN,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

export default {
  authenticateToken,
  authorize,
  farmerOnly,
  officerOnly,
  adminOnly,
  farmerOrOfficer,
  checkResourceOwnership,
};
