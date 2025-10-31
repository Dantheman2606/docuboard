// routes/projects.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Document = require('../models/Document');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ updatedAt: -1 });
    
    // Get document IDs for each project
    const projectsWithDocs = await Promise.all(
      projects.map(async (project) => {
        const docs = await Document.find({ projectId: project.id }).select('id title');
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          color: project.color,
          docs: docs.map(d => ({ id: d.id, title: d.title })),
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
    const project = await Project.findOne({ id: req.params.id });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const docs = await Document.find({ projectId: project.id }).select('id title');
    
    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      docs: docs.map(d => ({ id: d.id, title: d.title })),
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
    const project = new Project({
      id: projectId,
      ...req.body,
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

module.exports = router;
