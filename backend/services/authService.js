/**
 * Authentication Service
 * Business logic for authentication operations
 */

import User from '../models/User.js';
import FarmerProfile from '../models/FarmerProfile.js';
import OfficerProfile from '../models/OfficerProfile.js';
import {
  generateTokens,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import {
  generateOTP,
  generateResetToken,
  formatDate,
  paginate,
} from '../utils/helpers.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import config from '../config/env.js';

class AuthService {
  // User Registration
  async register(userData) {
    try {
      const { email, password, phoneNumber, firstName, lastName, role, state } =
        userData;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { phoneNumber: phoneNumber || null }],
      });

      if (existingUser) {
        throw {
          statusCode: HTTP_STATUS.CONFLICT,
          message:
            existingUser.email === email
              ? ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED
              : ERROR_MESSAGES.PHONE_ALREADY_REGISTERED,
        };
      }

      // Create new user
      const newUser = new User({
        email,
        password,
        phoneNumber: phoneNumber || null,
        role,
        profile: {
          firstName,
          lastName,
        },
        address: {
          state,
        },
      });

      await newUser.save();

      // Create role-specific profile
      if (role === 'farmer') {
        const farmerProfile = new FarmerProfile({
          userId: newUser._id,
          agricultural: {
            farmingType: 'conventional',
          },
          farm: {
            soilInfo: 'loamy',
          },
        });
        await farmerProfile.save();
      } else if (role === 'officer') {
        const officerProfile = new OfficerProfile({
          userId: newUser._id,
          department: 'Agriculture',
        });
        await officerProfile.save();
      }

      // Generate OTP for verification
      const otp = generateOTP();
      newUser.verification.otp.code = otp;
      newUser.verification.otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await newUser.save();

      // TODO: Send OTP via email/SMS

      return {
        success: true,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
        userId: newUser._id,
        email: newUser.email,
        requiresOtpVerification: true,
      };
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      throw {
        statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      };
    }
  }

  // User Login
  async login(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        throw {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        };
      }

      // Check if account is locked
      if (user.security.isLocked) {
        const now = new Date();
        if (now < user.security.lockedUntil) {
          throw {
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            message: ERROR_MESSAGES.ACCOUNT_LOCKED,
          };
        } else {
          // Unlock account
          user.security.isLocked = false;
          user.security.loginAttempts = 0;
          await user.save();
        }
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        // Increment login attempts
        user.security.loginAttempts = (user.security.loginAttempts || 0) + 1;

        // Lock account after 5 failed attempts
        if (user.security.loginAttempts >= config.admin.password || 5) {
          user.security.isLocked = true;
          user.security.lockedUntil = new Date(
            Date.now() + 30 * 60 * 1000
          ); // 30 minutes
        }

        await user.save();

        throw {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        };
      }

      // Check user status
      if (user.status !== 'active') {
        throw {
          statusCode: HTTP_STATUS.FORBIDDEN,
          message:
            user.status === 'suspended'
              ? ERROR_MESSAGES.USER_SUSPENDED
              : ERROR_MESSAGES.USER_DELETED,
        };
      }

      // Reset login attempts on successful login
      user.security.loginAttempts = 0;
      user.security.lastLoginAt = new Date();
      user.security.lastLoginIP = null; // TODO: Get from request
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens({
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      // Get user profile data
      const userProfile = user.toJSON();

      return {
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        accessToken,
        refreshToken,
        user: userProfile,
        expiresIn: config.jwtExpire,
      };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw {
        statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      };
    }
  }

  // Refresh Token
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });

      return {
        success: true,
        accessToken: newAccessToken,
        expiresIn: config.jwtExpire,
      };
    } catch (error) {
      logger.error(`Refresh token error: ${error.message}`);
      throw {
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: ERROR_MESSAGES.INVALID_TOKEN,
      };
    }
  }

  // Request Password Reset
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        // Don't reveal if email exists (security best practice)
        return {
          success: true,
          message: 'If email exists, password reset link will be sent',
        };
      }

      // Generate reset token
      const resetToken = generateResetToken();
      user.security.passwordResetToken = resetToken;
      user.security.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // TODO: Send reset link via email
      // const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;

      return {
        success: true,
        message: 'Password reset link sent to your email',
      };
    } catch (error) {
      logger.error(`Forgot password error: ${error.message}`);
      throw {
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      };
    }
  }

  // Reset Password
  async resetPassword(resetToken, newPassword) {
    try {
      const user = await User.findOne({
        'security.passwordResetToken': resetToken,
        'security.passwordResetExpires': { $gt: Date.now() },
      });

      if (!user) {
        throw {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: 'Invalid or expired reset token',
        };
      }

      // Update password
      user.password = newPassword;
      user.security.passwordResetToken = undefined;
      user.security.passwordResetExpires = undefined;
      user.security.passwordChangedAt = new Date();
      await user.save();

      return {
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      };
    } catch (error) {
      logger.error(`Reset password error: ${error.message}`);
      throw {
        statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      };
    }
  }

  // Verify OTP
  async verifyOTP(userId, otp) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        };
      }

      // Check OTP
      if (
        user.verification.otp.code !== otp ||
        new Date() > user.verification.otp.expiresAt
      ) {
        throw {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: ERROR_MESSAGES.INVALID_OTP,
        };
      }

      // Mark as verified
      user.verification.isEmailVerified = true;
      user.verification.emailVerifiedAt = new Date();
      user.verification.otp = {};
      await user.save();

      return {
        success: true,
        message: SUCCESS_MESSAGES.EMAIL_VERIFIED,
      };
    } catch (error) {
      logger.error(`OTP verification error: ${error.message}`);
      throw {
        statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      };
    }
  }

  // Get Current User
  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        };
      }

      return {
        success: true,
        user: user.toJSON(),
      };
    } catch (error) {
      logger.error(`Get current user error: ${error.message}`);
      throw {
        statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      };
    }
  }

  // Logout
  async logout() {
    // In JWT-based auth, logout is mainly a client-side operation
    // We could implement token blacklisting here if needed
    return {
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
    };
  }
}

export default new AuthService();
