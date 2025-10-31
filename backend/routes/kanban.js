// routes/kanban.js
const express = require('express');
const router = express.Router();
const KanbanBoard = require('../models/KanbanBoard');

// Get kanban board by project
router.get('/:projectId', async (req, res) => {
  try {
    let board = await KanbanBoard.findOne({ projectId: req.params.projectId });
    
    // Create default board if doesn't exist
    if (!board) {
      board = new KanbanBoard({
        projectId: req.params.projectId,
        columns: {
          todo: { id: 'todo', title: 'To Do', cardIds: [] },
          inprogress: { id: 'inprogress', title: 'In Progress', cardIds: [] },
          done: { id: 'done', title: 'Done', cardIds: [] }
        },
        cards: {},
        columnOrder: ['todo', 'inprogress', 'done']
      });
      await board.save();
    }
    
    // Convert Maps to objects for JSON response
    const boardObj = {
      projectId: board.projectId,
      columns: Object.fromEntries(board.columns),
      cards: Object.fromEntries(board.cards),
      columnOrder: board.columnOrder,
      updatedAt: board.updatedAt
    };
    
    res.json(boardObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update entire kanban board
router.put('/:projectId', async (req, res) => {
  try {
    const { columns, cards, columnOrder } = req.body;
    
    // Convert objects to Maps for MongoDB
    const columnsMap = new Map(Object.entries(columns));
    const cardsMap = new Map(Object.entries(cards));
    
    let board = await KanbanBoard.findOneAndUpdate(
      { projectId: req.params.projectId },
      {
        columns: columnsMap,
        cards: cardsMap,
        columnOrder,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );
    
    // Convert Maps back to objects for response
    const boardObj = {
      projectId: board.projectId,
      columns: Object.fromEntries(board.columns),
      cards: Object.fromEntries(board.cards),
      columnOrder: board.columnOrder,
      updatedAt: board.updatedAt
    };
    
    res.json(boardObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
