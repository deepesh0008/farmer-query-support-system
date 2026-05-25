/**
 * Environment Variables Configuration
 * Load and validate environment variables
 */

import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config({ override: true });

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'OPENAI_API_KEY',
  'CLOUDINARY_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

// Validate required environment variables
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  const message = `Missing required environment variables: ${missingVars.join(', ')}`;
  logger.error(message);
  if (process.env.NODE_ENV === 'production') {
    throw new Error(message);
  }
}

const config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 5000,
  appName: process.env.APP_NAME || 'Farmer Query Support System',

  // Database
  mongodbUri: process.env.MONGODB_URI,
  mongodbDbName: process.env.MONGODB_DB_NAME || 'farmer_query_db',
  mongodbTimeout: parseInt(process.env.MONGODB_TIMEOUT) || 30000,

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisPassword: process.env.REDIS_PASSWORD,

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',

  // Email
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@farmerquery.com',
    fromName: process.env.SMTP_FROM_NAME || 'Farmer Query Support',
  },

  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
  },

  // Google Cloud
  google: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    cloudApiKey: process.env.GOOGLE_CLOUD_API_KEY,
    translateApiKey: process.env.GOOGLE_TRANSLATE_API_KEY,
    visionApiKey: process.env.GOOGLE_VISION_API_KEY,
  },

  // Cloudinary
  cloudinary: {
    name: process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Weather API
  openweathermap: {
    apiKey: process.env.OPENWEATHERMAP_API_KEY,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    errorFile: process.env.ERROR_LOG_FILE || 'logs/error.log',
  },

  // CORS
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),

  // File Upload
  fileUpload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    allowedImageFormats: (
      process.env.ALLOWED_IMAGE_FORMATS || 'jpg,jpeg,png,webp,gif'
    ).split(','),
    allowedDocumentFormats: (
      process.env.ALLOWED_DOCUMENT_FORMATS || 'pdf,doc,docx,xls,xlsx'
    ).split(','),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    whitelist: (process.env.RATE_LIMIT_WHITELIST || '127.0.0.1').split(','),
  },

  // URLs
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Admin
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin123456',
  },
};

export default config;
