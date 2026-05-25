/**
 * Application Constants
 * Global constants and enumerations
 */

// User Roles
export const USER_ROLES = {
  FARMER: 'farmer',
  OFFICER: 'officer',
  ADMIN: 'admin',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
};

// Query Types
export const QUERY_TYPES = {
  TEXT: 'text',
  VOICE: 'voice',
  IMAGE: 'image',
};

// Query Status
export const QUERY_STATUS = {
  ANSWERED: 'answered',
  PENDING: 'pending',
  ESCALATED: 'escalated',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

// Escalation Status
export const ESCALATION_STATUS = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened',
};

// Escalation Priority
export const ESCALATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Crop Stages
export const CROP_STAGES = {
  GERMINATION: 'germination',
  SEEDLING: 'seedling',
  VEGETATIVE: 'vegetative',
  FLOWERING: 'flowering',
  FRUITING: 'fruiting',
  HARVESTING: 'harvesting',
};

// Seasons
export const SEASONS = {
  KHARIF: 'kharif',
  RABI: 'rabi',
  SUMMER: 'summer',
  PERENNIAL: 'perennial',
};

// Soil Types
export const SOIL_TYPES = {
  CLAY: 'clay',
  SANDY: 'sandy',
  LOAMY: 'loamy',
  SILTY: 'silty',
  MIXED: 'mixed',
};

// Farming Types
export const FARMING_TYPES = {
  ORGANIC: 'organic',
  CONVENTIONAL: 'conventional',
  MIXED: 'mixed',
};

// Supported Languages
export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  HI: 'hi',
  PA: 'pa',
  TA: 'ta',
  TE: 'te',
  BN: 'bn',
  MR: 'mr',
  KN: 'kn',
  ML: 'ml',
};

// Language Names
export const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'हिंदी',
  pa: 'ਪੰਜਾਬੀ',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
  mr: 'मराठी',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  QUERY_RESPONSE: 'query_response',
  ESCALATION: 'escalation',
  WEATHER_ALERT: 'weather_alert',
  MARKET_UPDATE: 'market_update',
  SCHEME_ALERT: 'scheme_alert',
  SYSTEM: 'system',
  MESSAGE: 'message',
};

// Notification Channels
export const NOTIFICATION_CHANNELS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
};

// Feedback Sentiments
export const FEEDBACK_SENTIMENTS = {
  VERY_POSITIVE: 'very-positive',
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative',
  VERY_NEGATIVE: 'very-negative',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Types
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'ValidationError',
  AUTHENTICATION_ERROR: 'AuthenticationError',
  AUTHORIZATION_ERROR: 'AuthorizationError',
  NOT_FOUND_ERROR: 'NotFoundError',
  CONFLICT_ERROR: 'ConflictError',
  INTERNAL_ERROR: 'InternalError',
};

// Rating Limits
export const RATING_LIMITS = {
  MIN: 1,
  MAX: 5,
};

// File Size Limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VOICE: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 20 * 1024 * 1024, // 20MB
};

// Token Types
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  VERIFY_EMAIL: 'verify_email',
  RESET_PASSWORD: 'reset_password',
};

// OTP Expiry Time (in minutes)
export const OTP_EXPIRY_MINUTES = 10;

// Max Login Attempts
export const MAX_LOGIN_ATTEMPTS = 5;

// Account Lock Duration (in minutes)
export const ACCOUNT_LOCK_DURATION_MINUTES = 30;

// Cache Keys
export const CACHE_KEYS = {
  USER_PREFIX: 'user:',
  SCHEME_PREFIX: 'scheme:',
  WEATHER_PREFIX: 'weather:',
  MARKET_PREFIX: 'market:',
  CROP_PREFIX: 'crop:',
};

// Cache Expiry Times (in seconds)
export const CACHE_EXPIRY = {
  USER: 3600, // 1 hour
  SCHEMES: 86400, // 24 hours
  WEATHER: 3600, // 1 hour
  MARKET_PRICES: 3600, // 1 hour
};

// API Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Disease Confidence Threshold for Escalation
export const AI_CONFIDENCE_THRESHOLD = 70;

// Months
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default {
  USER_ROLES,
  USER_STATUS,
  QUERY_TYPES,
  QUERY_STATUS,
  ESCALATION_STATUS,
  ESCALATION_PRIORITY,
  CROP_STAGES,
  SEASONS,
  SOIL_TYPES,
  FARMING_TYPES,
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  FEEDBACK_SENTIMENTS,
  HTTP_STATUS,
  ERROR_TYPES,
  RATING_LIMITS,
  FILE_SIZE_LIMITS,
  TOKEN_TYPES,
  OTP_EXPIRY_MINUTES,
  MAX_LOGIN_ATTEMPTS,
  ACCOUNT_LOCK_DURATION_MINUTES,
  CACHE_KEYS,
  CACHE_EXPIRY,
  PAGINATION,
  AI_CONFIDENCE_THRESHOLD,
  MONTHS,
};
