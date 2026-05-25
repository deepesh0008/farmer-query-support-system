/**
 * Database Configuration
 * Mongoose connection and setup
 */

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'farmer_query_db',
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_TIMEOUT) || 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
  }
};

export { connectDB, closeDB };
