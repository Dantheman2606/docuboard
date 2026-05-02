// routes/auth.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { validate } = require('../middleware/validation');
const authenticate = require('../middleware/auth');
const userService = require('../services/userService');
const { signToken } = require('../utils/jwt');
const { success, error } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

const signupSchema = Joi.object({
  username: Joi.string().trim().alphanum().min(3).max(30).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().trim().min(1).max(100).required(),
  role: Joi.string().valid('owner', 'admin', 'editor', 'viewer').default('viewer'),
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userService.findByEmailWithPassword(email);
    if (!user) return next(new AppError('Invalid credentials.', 401));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(new AppError('Invalid credentials.', 401));

    const token = signToken({ id: user._id.toString(), username: user.username, role: user.role });

    return success(res, {
      token,
      user: userService.formatUser(user),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/signup
router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const newUser = await userService.createUser(req.body);
    const token = signToken({ id: newUser._id.toString(), username: newUser.username, role: newUser.role });

    return success(res, {
      token,
      user: userService.formatUser(newUser),
    }, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me  (requires valid JWT)
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await userService.findById(req.user.id);
    return success(res, userService.formatUser(user));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
