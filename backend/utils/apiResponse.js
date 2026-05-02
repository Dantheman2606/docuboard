// utils/apiResponse.js

/**
 * Send a standardized success response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {number} [statusCode=200]
 * @param {string} [message]
 */
exports.success = (res, data, statusCode = 200, message) => {
  const body = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
};

/**
 * Send a standardized error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=400]
 */
exports.error = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({ success: false, error: message });
};
