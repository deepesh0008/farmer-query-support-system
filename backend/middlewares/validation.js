/**
 * Input Validation Middleware
 * Schema validation using express-validator and Joi
 */

import { validationResult } from 'express-validator';
import { HTTP_STATUS } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn(`Validation error: ${JSON.stringify(errors.array())}`);

    const formattedErrors = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: 'Validation failed',
      errors: formattedErrors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Validate using Joi schema
export const validateWithJoi = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      logger.warn(`Joi validation error: ${JSON.stringify(error.details)}`);

      const formattedErrors = error.details.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errors: formattedErrors,
        timestamp: new Date().toISOString(),
      });
    }

    // Replace request body with validated data
    req.body = value;
    next();
  };
};

export default {
  handleValidationErrors,
  validateWithJoi,
};
