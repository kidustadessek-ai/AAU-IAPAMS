import { logger } from '../utils/logger.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/index.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred', { 
    error: err.message, 
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: `${field} already exists.`,
    });
  }

  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid ID format.',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }

  res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || ERROR_MESSAGES.INTERNAL_ERROR,
  });
};

export const notFound = (req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
