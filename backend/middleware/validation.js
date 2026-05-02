// middleware/validation.js
const AppError = require('../utils/AppError');

/**
 * Returns an Express middleware that validates req.body against the given Joi schema.
 * Sends a 422 with validation details on failure.
 * @param {import('joi').Schema} schema
 */
exports.validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => d.message).join('; ');
    return next(new AppError(`Validation error: ${details}`, 422));
  }

  req.body = value;
  next();
};
