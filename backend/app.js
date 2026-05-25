/**
 * Express Application Setup
 * Main app configuration with middleware and route setup
 */

import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import config from './config/env.js';
import logger from './utils/logger.js';
import { HTTP_STATUS, ERROR_MESSAGES } from './utils/errorHandler.js';

const app = express();

// ============== SECURITY MIDDLEWARE ==============

// Helmet - Set security HTTP headers
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or file://)
    if (!origin) return callback(null, true);
    
    // In development mode, allow any local or development origin
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }
    
    // For production, check against whitelist
    if (config.corsOrigin.indexOf(origin) !== -1 || config.corsOrigin.includes('*')) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check or in local development mode
    return req.path === '/health' || config.nodeEnv === 'development';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      statusCode: 429,
      message: 'Too many requests, please try again later',
      timestamp: new Date().toISOString(),
    });
  },
});
app.use(limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increase rate limit slightly for active developer local testing
  skip: (req) => {
    // Skip rate limiting in development mode to prevent lockouts during local testing
    return config.nodeEnv === 'development';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      statusCode: 429,
      message: 'Too many login attempts, please try again later',
      timestamp: new Date().toISOString(),
    });
  },
});

// ============== BODY PARSING MIDDLEWARE ==============

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// ============== LOGGING MIDDLEWARE ==============

// Skip logging for health checks
morgan.token('user-id', (req) => req.user?._id || 'anonymous');
app.use(
  morgan(':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms', {
    skip: (req) => req.path === '/health',
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// ============== ROUTES ==============

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API version info
app.get('/api/version', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    version: '1.0.0',
    name: config.appName,
    environment: config.nodeEnv,
  });
});

// Import routes
import authRoutes from './routes/auth.js';
import queryRoutes from './routes/queries.js';
import mediaRoutes from './routes/media.js';
import weatherRoutes from './routes/weather.js';
import marketRoutes from './routes/market.js';
import schemeRoutes from './routes/schemes.js';
import escalationRoutes from './routes/escalations.js';
import imageAnalysisRoutes from './routes/imageAnalysis.js';
import voiceQueryRoutes from './routes/voiceQuery.js';
import escalateQueryRoutes from './routes/escalateQuery.js';

// Mount routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/queries', queryRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/market', marketRoutes);
app.use('/api/v1/schemes', schemeRoutes);
app.use('/api/v1/escalations', escalationRoutes);
app.use('/api/v1/image-analysis', imageAnalysisRoutes);
app.use('/api/v1/voice-query', voiceQueryRoutes);
app.use('/api/v1/escalate-query', escalateQueryRoutes);
// app.use('/api/v1/weather', weatherRoutes);
// app.use('/api/v1/market', marketRoutes);
// app.use('/api/v1/schemes', schemeRoutes);
// app.use('/api/v1/escalations', escalationRoutes);
// app.use('/api/v1/feedback', feedbackRoutes);
// app.use('/api/v1/officer', officerRoutes);
// app.use('/api/v1/admin', adminRoutes);

// ============== 404 HANDLER ==============

app.use('*', (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: ERROR_MESSAGES.NOT_FOUND,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// ============== GLOBAL ERROR HANDLER ==============

app.use((error, req, res, next) => {
  // Logging
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors)
      .map((err) => err.message)
      .join(', ');

    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      errors: messages,
      timestamp: new Date().toISOString(),
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      statusCode: HTTP_STATUS.CONFLICT,
      message: `${field} already exists`,
      field,
      timestamp: new Date().toISOString(),
    });
  }

  // Mongoose cast error
  if (error.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: 'Invalid ID format',
      timestamp: new Date().toISOString(),
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: ERROR_MESSAGES.INVALID_TOKEN,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: ERROR_MESSAGES.TOKEN_EXPIRED,
      timestamp: new Date().toISOString(),
    });
  }

  // Default error response
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message =
    error.message || ERROR_MESSAGES.INTERNAL_ERROR;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(config.nodeEnv === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString(),
  });
});

export default app;
