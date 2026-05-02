// middleware/auth.js
const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');

/**
 * Authenticate a request via Bearer JWT.
 * Attaches req.user = { id, username, role } on success.
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Please provide a valid token.', 401));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new AppError('Authentication token is missing.', 401));
    }

    const decoded = verifyToken(token);
    req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid authentication token.', 401));
    }
    next(err);
  }
};

module.exports = authenticate;
