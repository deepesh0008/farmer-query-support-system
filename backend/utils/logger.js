/**
 * Logger Utility
 * Winston logger configuration and setup
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}${
        info.stack ? `\n${info.stack}` : ''
      }`
  )
);

// Define transports
const transports = [
  // Console Transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format
    ),
  }),

  // Error File Transport
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format,
    maxsize: 10485760, // 10MB
    maxFiles: 10,
  }),

  // Combined File Transport
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format,
    maxsize: 10485760, // 10MB
    maxFiles: 10,
  }),

  // App Log File Transport
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    format,
    maxsize: 10485760, // 10MB
    maxFiles: 10,
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format,
    }),
  ],
});

export default logger;
