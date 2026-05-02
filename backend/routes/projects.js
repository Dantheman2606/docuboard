// routes/projects.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const authenticate = require('../middleware/auth');
const { requireProjectMember } = require('../middleware/permission');
const { validate } = require('../middleware/validation');
const projectService = require('../services/projectService');
const { success } = require('../utils/apiResponse');

const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(1000).allow('').default(''),
  color: Joi.string().trim().default('#3B82F6'),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().max(1000).allow(''),
  color: Joi.string().trim(),
});

const joinRequestSchema = Joi.object({
  code: Joi.string().trim().pattern(/^[0-9]{8}$/).required(),
});

const memberSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid('owner', 'admin', 'editor', 'viewer').default('viewer'),
});

// All routes require authentication
router.use(authenticate);

// GET /api/projects
router.get('/', async (req, res, next) => {
  try {
    const projects = await projectService.getProjects(req.user.id);
    return success(res, projects);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/join-request
router.post('/join-request', validate(joinRequestSchema), async (req, res, next) => {
  try {
    const project = await projectService.requestJoinByCode(req.body.code, req.user.id);
    return success(res, project, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.id);
    return success(res, project);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects
router.post('/', validate(createProjectSchema), async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    return success(res, project, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id  (editor+ required)
router.put('/:id', requireProjectMember('editor'), validate(updateProjectSchema), async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    return success(res, project);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id  (owner only)
router.delete('/:id', requireProjectMember('owner'), async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id);
    return success(res, result);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/members  (admin+ required)
router.post('/:id/members', requireProjectMember('admin'), validate(memberSchema), async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const project = await projectService.addMember(req.params.id, userId, role);
    return success(res, project);
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id/members/:memberId  (admin+ required)
router.put('/:id/members/:memberId', requireProjectMember('owner'), async (req, res, next) => {
  try {
    const project = await projectService.updateMemberRole(req.params.id, req.params.memberId, req.body.role);
    return success(res, project);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id/members/:memberId  (admin+ required)
router.delete('/:id/members/:memberId', requireProjectMember('admin'), async (req, res, next) => {
  try {
    const project = await projectService.removeMember(req.params.id, req.params.memberId);
    return success(res, project);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/requests  (owner only)
router.get('/:id/requests', requireProjectMember('owner'), async (req, res, next) => {
  try {
    const requests = await projectService.getJoinRequestsForProject(req.params.id);
    return success(res, { requests });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/requests/:userId/approve  (owner only)
router.post('/:id/requests/:userId/approve', requireProjectMember('owner'), async (req, res, next) => {
  try {
    const project = await projectService.approveJoinRequest(req.params.id, req.params.userId);
    return success(res, project);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id/requests/:userId  (owner only)
router.delete('/:id/requests/:userId', requireProjectMember('owner'), async (req, res, next) => {
  try {
    const project = await projectService.rejectJoinRequest(req.params.id, req.params.userId);
    return success(res, project);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
