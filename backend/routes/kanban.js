// routes/kanban.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const kanbanService = require('../services/kanbanService');
const cardService = require('../services/cardService');
const { success } = require('../utils/apiResponse');

router.use(authenticate);

// GET /api/kanban/project/:projectId
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const boards = await kanbanService.getBoardsByProject(req.params.projectId);
    return success(res, boards);
  } catch (err) {
    next(err);
  }
});

// GET /api/kanban/:boardId
router.get('/:boardId', async (req, res, next) => {
  try {
    const board = await kanbanService.getBoardById(req.params.boardId);
    return success(res, board);
  } catch (err) {
    next(err);
  }
});

// POST /api/kanban
router.post('/', async (req, res, next) => {
  try {
    const board = await kanbanService.createBoard({
      name: req.body.name,
      projectId: req.body.projectId,
      columnOrder: req.body.columnOrder,
      columns: req.body.columns,
    });
    return success(res, board, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/kanban/:boardId
router.put('/:boardId', async (req, res, next) => {
  try {
    const board = await kanbanService.updateBoard(req.params.boardId, req.body);
    return success(res, board);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/kanban/:boardId
router.delete('/:boardId', async (req, res, next) => {
  try {
    const result = await kanbanService.deleteBoard(req.params.boardId);
    return success(res, result);
  } catch (err) {
    next(err);
  }
});

// ===== Card sub-routes =====

// GET /api/kanban/:boardId/cards
router.get('/:boardId/cards', async (req, res, next) => {
  try {
    const cards = await cardService.getCardsByBoard(req.params.boardId);
    return success(res, cards);
  } catch (err) {
    next(err);
  }
});

// POST /api/kanban/:boardId/cards
router.post('/:boardId/cards', async (req, res, next) => {
  try {
    const card = await cardService.createCard({
      ...req.body,
      boardId: req.params.boardId,
      createdBy: req.user.id,
      userId: req.user.id,
      authorName: req.user.username,
    });
    return success(res, card, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/kanban/:boardId/cards/:cardId
router.put('/:boardId/cards/:cardId', async (req, res, next) => {
  try {
    const card = await cardService.updateCard(req.params.cardId, req.body);
    return success(res, card);
  } catch (err) {
    next(err);
  }
});

// POST /api/kanban/:boardId/cards/:cardId/move
router.post('/:boardId/cards/:cardId/move', async (req, res, next) => {
  try {
    const card = await cardService.moveCard(req.params.cardId, req.body);
    return success(res, card);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/kanban/:boardId/cards/:cardId
router.delete('/:boardId/cards/:cardId', async (req, res, next) => {
  try {
    const result = await cardService.deleteCard(req.params.cardId);
    return success(res, result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
