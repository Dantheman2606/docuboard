// middleware/permission.js
const AppError = require('../utils/AppError');
const Project = require('../models/Project');

const ROLE_HIERARCHY = { owner: 4, admin: 3, editor: 2, viewer: 1 };

/**
 * Require the authenticated user to have one of the given global roles.
 * @param {...string} roles
 */
exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication required.', 401));
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

/**
 * Require the authenticated user to be a project member with at least minRole.
 * Reads projectId from req.params.id or req.params.projectId.
 * Attaches req.projectRole to the request.
 * @param {string} [minRole='viewer'] - Minimum required role
 */
exports.requireProjectMember = (minRole = 'viewer') => async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Authentication required.', 401));

    const projectId = req.params.id || req.params.projectId;
    if (!projectId) return next(new AppError('Project ID is required.', 400));

    const project = await Project.findById(projectId);
    if (!project) return next(new AppError('Project not found.', 404));

    const member = project.members.find(
      (m) => m.userId.toString() === req.user.id
    );

    if (!member) {
      return next(new AppError('You are not a member of this project.', 403));
    }

    const memberLevel = ROLE_HIERARCHY[member.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (memberLevel < requiredLevel) {
      return next(new AppError(`This action requires at least the "${minRole}" role in this project.`, 403));
    }

    req.projectRole = member.role;
    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};
