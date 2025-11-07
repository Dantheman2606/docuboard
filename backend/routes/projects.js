// routes/projects.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Document = require('../models/Document');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // If userId is provided, only fetch projects where user is a member
    let query = {};
    if (userId) {
      query = { 'members.userId': userId };
    }
    
    const projects = await Project.find(query).sort({ updatedAt: -1 }).populate('members.userId', 'name username');
    
    // Get document IDs for each project
    const projectsWithDocs = await Promise.all(
      projects.map(async (project) => {
        const docs = await Document.find({ projectId: project.id }).select('id title');
        
        // Find user's role in this project
        const userMember = userId ? project.members.find(m => m.userId._id.toString() === userId) : null;
        
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          color: project.color,
          docs: docs.map(d => ({ id: d.id, title: d.title })),
          members: project.members.map(m => ({
            userId: m.userId._id,
            name: m.userId.name,
            username: m.userId.username,
            role: m.role,
            addedAt: m.addedAt
          })),
          userRole: userMember ? userMember.role : null,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        };
      })
    );
    
    res.json(projectsWithDocs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const project = await Project.findOne({ id: req.params.id }).populate('members.userId', 'name username');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is a member of this project (if userId is provided)
    if (userId) {
      const userMember = project.members.find(m => m.userId._id.toString() === userId);
      if (!userMember) {
        return res.status(403).json({ error: 'Access denied. You are not a member of this project.' });
      }
    }
    
    const docs = await Document.find({ projectId: project.id }).select('id title');
    
    // Find user's role in this project
    const userMember = userId ? project.members.find(m => m.userId._id.toString() === userId) : null;
    
    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      docs: docs.map(d => ({ id: d.id, title: d.title })),
      members: project.members.map(m => ({
        userId: m.userId._id,
        name: m.userId.name,
        username: m.userId.username,
        role: m.role,
        addedAt: m.addedAt
      })),
      userRole: userMember ? userMember.role : null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    const projectId = `p${Date.now()}`;
    const { userId, ...projectData } = req.body;
    
    // Create project with creator as owner
    const project = new Project({
      id: projectId,
      ...projectData,
      createdBy: userId,
      members: userId ? [{
        userId: userId,
        role: 'owner',
        addedAt: new Date()
      }] : [],
      updatedAt: new Date()
    });
    await project.save();

    // Create default Kanban board for the project
    const KanbanBoard = require('../models/KanbanBoard');
    const boardId = `board_${Date.now()}`;
    const defaultBoard = new KanbanBoard({
      id: boardId,
      name: 'Main Board',
      projectId: projectId,
      columns: {
        todo: { id: 'todo', title: 'To Do', cardIds: [] },
        inprogress: { id: 'inprogress', title: 'In Progress', cardIds: [] },
        done: { id: 'done', title: 'Done', cardIds: [] },
      },
      cards: {},
      columnOrder: ['todo', 'inprogress', 'done'],
    });
    await defaultBoard.save();

    // Create default document for the project
    const docId = `doc_${Date.now()}`;
    const defaultDoc = new Document({
      id: docId,
      title: 'Welcome Document',
      content: '<h1>Welcome to your new project!</h1><p>Start writing here...</p>',
      projectId: projectId
    });
    await defaultDoc.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ id: req.params.id });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to project
router.post('/:id/members', async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findOne({ id: req.params.id });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is already a member
    const existingMember = project.members.find(m => m.userId.toString() === userId);
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    project.members.push({
      userId,
      role: role || 'viewer',
      addedAt: new Date()
    });

    await project.save();
    await project.populate('members.userId', 'name username');
    
    res.json({
      members: project.members.map(m => ({
        userId: m.userId._id,
        name: m.userId.name,
        username: m.userId.username,
        role: m.role,
        addedAt: m.addedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update member role
router.put('/:id/members/:userId', async (req, res) => {
  try {
    const { role } = req.body;
    const project = await Project.findOne({ id: req.params.id });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const member = project.members.find(m => m.userId.toString() === req.params.userId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    member.role = role;
    await project.save();
    await project.populate('members.userId', 'name username');
    
    res.json({
      members: project.members.map(m => ({
        userId: m.userId._id,
        name: m.userId.name,
        username: m.userId.username,
        role: m.role,
        addedAt: m.addedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove member from project
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.members = project.members.filter(m => m.userId.toString() !== req.params.userId);
    await project.save();
    await project.populate('members.userId', 'name username');
    
    res.json({
      members: project.members.map(m => ({
        userId: m.userId._id,
        name: m.userId.name,
        username: m.userId.username,
        role: m.role,
        addedAt: m.addedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
