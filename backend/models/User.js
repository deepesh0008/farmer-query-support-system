/**
 * User Model
 * Base user schema for all user types (Farmer, Officer, Admin)
 */

import mongoose from 'mongoose';
import { hashPassword } from '../utils/password.js';
import {
  USER_ROLES,
  USER_STATUS,
  SUPPORTED_LANGUAGES,
} from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    // Authentication
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },

    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // Role & Status
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLES),
        message: 'Invalid role',
      },
      default: USER_ROLES.FARMER,
      required: true,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(USER_STATUS),
        message: 'Invalid status',
      },
      default: USER_STATUS.ACTIVE,
    },

    // Profile Information
    profile: {
      firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
      },

      lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
      },

      profilePicture: {
        type: String,
        default: null,
      },

      preferredLanguage: {
        type: String,
        enum: {
          values: Object.values(SUPPORTED_LANGUAGES),
          message: 'Invalid language',
        },
        default: 'en',
      },

      bio: String,

      dateOfBirth: Date,
    },

    // Address
    address: {
      street: String,
      city: String,
      state: {
        type: String,
        required: true,
      },
      district: String,
      village: String,
      pincode: String,
      country: {
        type: String,
        default: 'India',
      },
    },

    // Verification
    verification: {
      isEmailVerified: {
        type: Boolean,
        default: false,
      },

      emailVerifiedAt: Date,

      isPhoneVerified: {
        type: Boolean,
        default: false,
      },

      phoneVerifiedAt: Date,

      verificationToken: String,

      verificationTokenExpiry: Date,

      otp: {
        code: String,
        expiresAt: Date,
        attempts: {
          type: Number,
          default: 0,
        },
        lastAttemptAt: Date,
      },
    },

    // Security
    security: {
      passwordChangedAt: Date,

      passwordResetToken: String,

      passwordResetExpires: Date,

      loginAttempts: {
        type: Number,
        default: 0,
      },

      isLocked: {
        type: Boolean,
        default: false,
      },

      lockedUntil: Date,

      lastLoginAt: Date,

      lastLoginIP: String,

      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },

      twoFactorSecret: String,
    },

    // Activity
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    lastActivityAt: Date,

    loginCount: {
      type: Number,
      default: 0,
    },

    // Notifications & Preferences
    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },

      smsNotifications: {
        type: Boolean,
        default: true,
      },

      pushNotifications: {
        type: Boolean,
        default: true,
      },

      queryNotifications: {
        type: Boolean,
        default: true,
      },

      weatherAlerts: {
        type: Boolean,
        default: true,
      },

      schemeUpdates: {
        type: Boolean,
        default: true,
      },

      marketPriceAlerts: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'verification.isEmailVerified': 1 });
userSchema.index({ 'verification.isPhoneVerified': 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Update password changed timestamp
userSchema.pre('save', function (next) {
  if (this.isModified('password') && !this.isNew) {
    this.security.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Method to get safe user data (exclude sensitive fields)
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.security.passwordResetToken;
  delete user.security.passwordResetExpires;
  delete user.security.twoFactorSecret;
  delete user.verification.otp;
  delete user.verification.verificationToken;
  return user;
};

// Compound index for efficient queries
userSchema.index({ role: 1, status: 1, createdAt: -1 });
userSchema.index({ 'profile.preferredLanguage': 1 });
userSchema.index({ 'address.state': 1, 'address.district': 1 });

const User = mongoose.model('User', userSchema);

export default User;
