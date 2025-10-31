// routes/kanban.js
const express = require('express');
const router = express.Router();
const KanbanBoard = require('../models/KanbanBoard');

// Get all kanban boards for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const boards = await KanbanBoard.find({ projectId: req.params.projectId })
      .sort({ createdAt: 1 });
    
    const boardsArray = boards.map(board => ({
      id: board.id,
      name: board.name,
      projectId: board.projectId,
      columns: Object.fromEntries(board.columns),
      cards: Object.fromEntries(board.cards),
      columnOrder: board.columnOrder,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt
    }));
    
    res.json(boardsArray);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single kanban board by ID
router.get('/:boardId', async (req, res) => {
  try {
    const board = await KanbanBoard.findOne({ id: req.params.boardId });
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const boardObj = {
      id: board.id,
      name: board.name,
      projectId: board.projectId,
      columns: Object.fromEntries(board.columns),
      cards: Object.fromEntries(board.cards),
      columnOrder: board.columnOrder,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt
    };
    
    res.json(boardObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new kanban board
router.post('/', async (req, res) => {
  try {
    const boardId = req.body.id || `board_${Date.now()}`;
    
    // Default columns if not provided
    const defaultColumns = {
      todo: { id: 'todo', title: 'To Do', cardIds: [] },
      inprogress: { id: 'inprogress', title: 'In Progress', cardIds: [] },
      done: { id: 'done', title: 'Done', cardIds: [] }
    };
    
    // Convert columns object to Map
    const columnsData = req.body.columns || defaultColumns;
    const columnsMap = new Map(Object.entries(columnsData));
    
    // Convert cards object to Map
    const cardsData = req.body.cards || {};
    const cardsMap = new Map(Object.entries(cardsData));
    
    const board = new KanbanBoard({
      id: boardId,
      name: req.body.name || 'New Board',
      projectId: req.body.projectId,
      columns: columnsMap,
      cards: cardsMap,
      columnOrder: req.body.columnOrder || ['todo', 'inprogress', 'done']
    });
    
    await board.save();
    
    const boardObj = {
      id: board.id,
      name: board.name,
      projectId: board.projectId,
      columns: Object.fromEntries(board.columns),
      cards: Object.fromEntries(board.cards),
      columnOrder: board.columnOrder,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt
    };
    
    res.status(201).json(boardObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update kanban board (content or name)
router.put('/:boardId', async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    
    // Convert columns and cards to Maps if they exist in the request
    if (req.body.columns) {
      updateData.columns = new Map(Object.entries(req.body.columns));
    }
    if (req.body.cards) {
      updateData.cards = new Map(Object.entries(req.body.cards));
    }
    
    const board = await KanbanBoard.findOneAndUpdate(
      { id: req.params.boardId },
      updateData,
      { new: true }
    );
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const boardObj = {
      id: board.id,
      name: board.name,
      projectId: board.projectId,
      columns: Object.fromEntries(board.columns),
      cards: Object.fromEntries(board.cards),
      columnOrder: board.columnOrder,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt
    };
    
    res.json(boardObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete kanban board
router.delete('/:boardId', async (req, res) => {
  try {
    const board = await KanbanBoard.findOneAndDelete({ id: req.params.boardId });
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
