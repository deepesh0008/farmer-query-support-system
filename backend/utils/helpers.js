/**
 * Helper Functions
 * General utility functions
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Generate unique ID
export const generateId = () => uuidv4();

// Generate OTP
export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Generate reset token
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  return phone.replace(/\D/g, '');
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
  return phoneRegex.test(formatPhoneNumber(phone));
};

// Validate password strength
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
    return {
      valid: false,
      message:
        'Password must contain uppercase, lowercase, numbers and special characters',
    };
  }

  return { valid: true, message: 'Password is strong' };
};

// Convert date to readable format
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  const replacements = {
    YYYY: year,
    MM: month,
    DD: day,
    HH: hours,
    mm: minutes,
    ss: seconds,
  };

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (matched) => replacements[matched]);
};

// Calculate days between dates
export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Check if object is empty
export const isEmpty = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return true;
  }
  return Object.keys(obj).length === 0;
};

// Deep clone object
export const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
};

// Pagination helper
export const paginate = (page = 1, limit = 20) => {
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Calculate pagination metadata
export const paginationMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

// Sanitize string (remove special characters)
export const sanitizeString = (str) => {
  if (!str) return '';
  return str.replace(/[<>\"'`]/g, '');
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Get initials from name
export const getInitials = (firstName, lastName = '') => {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return first + last;
};

// Check if date is in past
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

// Check if date is in future
export const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

// Get current timestamp
export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

// Add days to date
export const addDaysToDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Convert array to object by key
export const arrayToObjectByKey = (arr, key) => {
  if (!Array.isArray(arr)) return {};
  return arr.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
};

// Group array by key
export const groupByKey = (arr, key) => {
  if (!Array.isArray(arr)) return {};
  return arr.reduce((acc, item) => {
    const groupKey = item[key];
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {});
};

// Flatten array of arrays
export const flattenArray = (arr) => {
  return arr.reduce((acc, item) => {
    if (Array.isArray(item)) {
      acc.push(...flattenArray(item));
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
};

// Remove duplicates from array
export const removeDuplicates = (arr, key) => {
  if (key) {
    const seen = new Set();
    return arr.filter((item) => {
      if (seen.has(item[key])) return false;
      seen.add(item[key]);
      return true;
    });
  }
  return [...new Set(arr)];
};

export default {
  generateId,
  generateOTP,
  generateResetToken,
  generateVerificationToken,
  formatPhoneNumber,
  isValidEmail,
  isValidPhone,
  validatePasswordStrength,
  formatDate,
  daysBetween,
  isEmpty,
  deepClone,
  paginate,
  paginationMeta,
  sanitizeString,
  capitalize,
  getInitials,
  isPastDate,
  isFutureDate,
  getCurrentTimestamp,
  addDaysToDate,
  arrayToObjectByKey,
  groupByKey,
  flattenArray,
  removeDuplicates,
};
