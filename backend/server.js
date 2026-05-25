/**
 * Server Entry Point
 * Initialize and start the Express server
 */

import dotenv from 'dotenv';
dotenv.config({ override: true });
import app from './app.js';
import { connectDB, closeDB } from './config/database.js';
import config from './config/env.js';
import logger from './utils/logger.js';

const PORT = config.port;

let server;

// ============== DATABASE CONNECTION ==============

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Database connected successfully');

    // Start Express server
    server = app.listen(PORT, () => {
      logger.info(
        `Server running on http://localhost:${PORT} (${config.nodeEnv})`
      );
      logger.info('Press Ctrl+C to stop the server');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        logger.error(`Server error: ${error.message}`);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// ============== GRACEFUL SHUTDOWN ==============

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      // Close database connection
      await closeDB();

      logger.info('Application terminated gracefully');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}`);
  logger.error(`Reason: ${reason}`);
  process.exit(1);
});

// ============== START SERVER ==============

startServer();

export default server;
