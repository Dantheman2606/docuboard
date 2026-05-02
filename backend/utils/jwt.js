// utils/jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️  JWT_SECRET is not set in environment variables!');
}

/**
 * Sign a JWT token.
 * @param {object} payload - Data to encode (e.g. { id, username, role })
 * @returns {string} Signed JWT
 */
exports.signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a JWT token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
