// routes/users.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const authenticate = require('../middleware/auth');
const userService = require('../services/userService');
const { validate } = require('../middleware/validation');
const Project = require('../models/Project');
const { success } = require('../utils/apiResponse');

const updateUserSchema = Joi.object({
  username: Joi.string().trim().alphanum().min(3).max(30),
  name: Joi.string().trim().min(1).max(100),
});

router.use(authenticate);

// GET /api/users/search?query=...
router.get('/search', async (req, res, next) => {
  try {
    const users = await userService.searchUsers(req.query.query || '', 10);
    return success(res, users.map((u) => ({
      id: u._id.toString(),
      _id: u._id.toString(),
      username: u.username,
      name: u.name,
    })));
  } catch (err) {
    next(err);
  }
});

// GET /api/users/me/settings
router.get('/me/settings', async (req, res, next) => {
  try {
    const user = await userService.findById(req.user.id);
    const projects = await Project.find({ 'members.userId': req.user.id })
      .select('name color members')
      .lean();

    const projectSummaries = projects.map((project) => {
      const member = project.members.find((m) => m.userId.toString() === req.user.id);
      return {
        id: project._id.toString(),
        name: project.name,
        color: project.color,
        role: member ? member.role : 'viewer',
      };
    });

    return success(res, {
      user: userService.formatUser(user),
      projectCount: projectSummaries.length,
      projects: projectSummaries,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/me
router.patch('/me', validate(updateUserSchema), async (req, res, next) => {
  try {
    const updated = await userService.updateUser(req.user.id, req.body);
    return success(res, userService.formatUser(updated));
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    return success(res, userService.formatUser(user));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
