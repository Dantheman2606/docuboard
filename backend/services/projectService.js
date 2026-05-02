// services/projectService.js
const Project = require('../models/Project');
const Document = require('../models/Document');
const KanbanBoard = require('../models/KanbanBoard');
const AppError = require('../utils/AppError');

/**
 * Serialize a populated project document into the API response shape.
 */
const formatProject = async (project, userId) => {
  const docs = await Document.find({ projectId: project._id }).select('title').lean();
  const userMember = userId
    ? project.members.find((m) => m.userId._id.toString() === userId || m.userId.toString() === userId)
    : null;

  return {
    id: project._id.toString(),
    name: project.name,
    description: project.description,
    color: project.color,
    docs: docs.map((d) => ({ id: d._id.toString(), title: d.title })),
    members: project.members.map((m) => ({
      userId: m.userId._id ? m.userId._id.toString() : m.userId.toString(),
      name: m.userId.name || undefined,
      username: m.userId.username || undefined,
      role: m.role,
      addedAt: m.addedAt,
    })),
    userRole: userMember ? userMember.role : null,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
};

exports.formatProject = formatProject;

/**
 * Get all projects the user is a member of.
 */
exports.getProjects = async (userId) => {
  const query = userId ? { 'members.userId': userId } : {};
  const projects = await Project.find(query)
    .sort({ updatedAt: -1 })
    .populate('members.userId', 'name username');
  return Promise.all(projects.map((p) => formatProject(p, userId)));
};

/**
 * Get a single project by _id, verifying membership.
 */
exports.getProjectById = async (projectId, userId) => {
  const project = await Project.findById(projectId).populate('members.userId', 'name username');
  if (!project) throw new AppError('Project not found.', 404);

  if (userId) {
    const isMember = project.members.some((m) => m.userId._id.toString() === userId);
    if (!isMember) throw new AppError('Access denied. You are not a member of this project.', 403);
  }

  return formatProject(project, userId);
};

/**
 * Create a new project with the creator as owner.
 * Also creates a default KanbanBoard and a Welcome Document.
 */
exports.createProject = async ({ name, description, color }, creatorId) => {
  const project = new Project({
    name,
    description: description || '',
    color: color || '#3B82F6',
    createdBy: creatorId,
    members: creatorId ? [{ userId: creatorId, role: 'owner', addedAt: new Date() }] : [],
  });
  await project.save();

  // Default kanban board
  const defaultBoard = new KanbanBoard({
    name: 'Main Board',
    projectId: project._id,
    columns: new Map([
      ['todo',       { id: 'todo',       title: 'To Do',       cardIds: [] }],
      ['inprogress', { id: 'inprogress', title: 'In Progress', cardIds: [] }],
      ['done',       { id: 'done',       title: 'Done',        cardIds: [] }],
    ]),
    columnOrder: ['todo', 'inprogress', 'done'],
  });
  await defaultBoard.save();

  // Default welcome document
  const defaultDoc = new Document({
    title: 'Welcome Document',
    content: '<h1>Welcome to your new project!</h1><p>Start writing here...</p>',
    projectId: project._id,
    createdBy: creatorId || null,
  });
  await defaultDoc.save();

  return formatProject(
    await Project.findById(project._id).populate('members.userId', 'name username'),
    creatorId
  );
};

/**
 * Update a project by _id.
 */
exports.updateProject = async (projectId, updates) => {
  const allowed = ['name', 'description', 'color'];
  const safeUpdates = {};
  allowed.forEach((k) => { if (updates[k] !== undefined) safeUpdates[k] = updates[k]; });

  const project = await Project.findByIdAndUpdate(projectId, safeUpdates, { new: true })
    .populate('members.userId', 'name username');
  if (!project) throw new AppError('Project not found.', 404);
  return formatProject(project, null);
};

/**
 * Delete a project and all its documents/boards.
 */
exports.deleteProject = async (projectId) => {
  const project = await Project.findByIdAndDelete(projectId);
  if (!project) throw new AppError('Project not found.', 404);

  // Cascade: remove documents and boards
  await Promise.all([
    Document.deleteMany({ projectId }),
    KanbanBoard.deleteMany({ projectId }),
  ]);

  return { message: 'Project deleted successfully.' };
};

/**
 * Add a member to a project.
 */
exports.addMember = async (projectId, userId, role) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError('Project not found.', 404);

  const alreadyMember = project.members.some((m) => m.userId.toString() === userId);
  if (alreadyMember) throw new AppError('User is already a member of this project.', 409);

  project.members.push({ userId, role: role || 'viewer', addedAt: new Date() });
  await project.save();
  await project.populate('members.userId', 'name username');
  return formatProject(project, null);
};

/**
 * Update a member's role.
 */
exports.updateMemberRole = async (projectId, memberId, role) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError('Project not found.', 404);

  const member = project.members.find((m) => m.userId.toString() === memberId);
  if (!member) throw new AppError('Member not found.', 404);

  member.role = role;
  await project.save();
  await project.populate('members.userId', 'name username');
  return formatProject(project, null);
};

/**
 * Remove a member from a project.
 */
exports.removeMember = async (projectId, memberId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError('Project not found.', 404);

  project.members = project.members.filter((m) => m.userId.toString() !== memberId);
  await project.save();
  await project.populate('members.userId', 'name username');
  return formatProject(project, null);
};
