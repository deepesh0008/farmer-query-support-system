/**
 * Authentication Controller
 * Handle HTTP requests for authentication operations
 */

import authService from '../services/authService.js';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

// Register User
export const register = async (req, res, next) => {
  try {
    const { email, password, confirmPassword, firstName, lastName, role, state } =
      req.body;

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: 'Passwords do not match',
        timestamp: new Date().toISOString(),
      });
    }

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      role,
      state,
      phoneNumber: req.body.phoneNumber,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      statusCode: HTTP_STATUS.CREATED,
      message: result.message,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Register controller error: ${error.message}`);
    return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Login User
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Set refresh token in http-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: {
        accessToken: result.accessToken,
        user: result.user,
        expiresIn: result.expiresIn,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Login controller error: ${error.message}`);
    return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Refresh Token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'Refresh token is required',
        timestamp: new Date().toISOString(),
      });
    }

    const result = await authService.refreshToken(refreshToken);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      statusCode: HTTP_STATUS.OK,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Refresh token controller error: ${error.message}`);
    return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Forgot password controller error: ${error.message}`);
    return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: 'Passwords do not match',
        timestamp: new Date().toISOString(),
      });
    }

    const result = await authService.resetPassword(resetToken, password);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Reset password controller error: ${error.message}`);
    return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    const result = await authService.verifyOTP(userId, otp);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Verify OTP controller error: ${error.message}`);
    return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Get Current User
export const getCurrentUser = async (req, res, next) => {
  try {
    const result = await authService.getCurrentUser(req.user._id);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      statusCode: HTTP_STATUS.OK,
      message: 'User retrieved successfully',
      data: result.user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Get current user controller error: ${error.message}`);
    return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    const result = await authService.logout();

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Logout controller error: ${error.message}`);
    return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

export default {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyOTP,
  getCurrentUser,
  logout,
};
