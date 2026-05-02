// middleware/errorHandler.js
const AppError = require('../utils/AppError');

const handleCastError = (err) => new AppError(`Invalid value for field: ${err.path}`, 400);
const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  return new AppError(`A record with that ${field} already exists.`, 409);
};
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message).join('; ');
  return new AppError(`Validation error: ${messages}`, 422);
};
const handleJWTError = () => new AppError('Invalid authentication token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Your session has expired. Please log in again.', 401);

/**
 * Central Express error-handling middleware.
 * Must be registered last, after all routes.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert known Mongoose / JWT errors into AppErrors
  if (error.name === 'CastError') error = handleCastError(error);
  if (error.code === 11000) error = handleDuplicateKey(error);
  if (error.name === 'ValidationError') error = handleValidationError(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
  }

  // Unexpected / programmer errors — don't leak details in production
  console.error('💥 Unhandled Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message,
  });
};

module.exports = errorHandler;
