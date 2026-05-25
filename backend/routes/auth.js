/**
 * Authentication Routes
 * Define authentication endpoints
 */

import express from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/validation.js';

const router = express.Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required'),
    body('role')
      .isIn(['farmer', 'officer'])
      .withMessage('Invalid role'),
    body('state')
      .trim()
      .notEmpty()
      .withMessage('State is required'),
    body('phoneNumber')
      .optional({ checkFalsy: true })
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Valid Indian phone number required (must start with 6, 7, 8, or 9)'),
  ],
  handleValidationErrors,
  authController.register
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  handleValidationErrors,
  authController.login
);

/**
 * POST /api/v1/auth/refresh-token
 * Refresh access token
 */
router.post(
  '/refresh-token',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ],
  handleValidationErrors,
  authController.refreshToken
);

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset
 */
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
  ],
  handleValidationErrors,
  authController.forgotPassword
);

/**
 * POST /api/v1/auth/reset-password
 * Reset password with token
 */
router.post(
  '/reset-password',
  [
    body('resetToken')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
  ],
  handleValidationErrors,
  authController.resetPassword
);

/**
 * POST /api/v1/auth/verify-otp
 * Verify OTP for email/phone
 */
router.post(
  '/verify-otp',
  [
    body('userId')
      .notEmpty()
      .withMessage('User ID is required'),
    body('otp')
      .matches(/^\d{6}$/)
      .withMessage('OTP must be 6 digits'),
  ],
  handleValidationErrors,
  authController.verifyOTP
);

/**
 * GET /api/v1/auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  authenticateToken,
  authController.getCurrentUser
);

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post(
  '/logout',
  authenticateToken,
  authController.logout
);

export default router;
