// services/cardService.js
const Card = require('../models/Card');
const KanbanBoard = require('../models/KanbanBoard');
const Activity = require('../models/Activity');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

const formatCard = (card) => ({
  id: card._id.toString(),
  title: card.title,
  description: card.description || '',
  assignee: card.assigneeName || '',
  labels: card.labels || [],
  dueDate: card.dueDate ? card.dueDate.toISOString().split('T')[0] : null,
  boardId: card.boardId.toString(),
  columnId: card.columnId,
  order: card.order,
  createdAt: card.createdAt,
  updatedAt: card.updatedAt,
});

exports.formatCard = formatCard;

exports.getCardsByBoard = async (boardId) => {
  const cards = await Card.find({ boardId }).sort({ columnId: 1, order: 1 });
  return cards.map(formatCard);
};

exports.getCardById = async (cardId) => {
  const card = await Card.findById(cardId);
  if (!card) throw new AppError('Card not found.', 404);
  return formatCard(card);
};

exports.createCard = async ({ title, description, assignee, labels, dueDate, boardId, columnId, createdBy, userId, authorName, projectId }) => {
  const board = await KanbanBoard.findById(boardId);
  if (!board) throw new AppError('Board not found.', 404);

  const targetColumnId = columnId || (board.columnOrder && board.columnOrder[0]) || 'todo';

  const cardsInCol = await Card.countDocuments({ boardId, columnId: targetColumnId });
  const card = new Card({
    title,
    description: description || '',
    assigneeName: assignee || '',
    labels: labels || [],
    dueDate: dueDate ? new Date(dueDate) : null,
    boardId,
    columnId: targetColumnId,
    order: cardsInCol,
    createdBy: createdBy || null,
  });
  await card.save();

  // Add card to the column's cardIds
  if (board.columns && board.columns.has(targetColumnId)) {
    const col = board.columns.get(targetColumnId);
    col.cardIds = [...(col.cardIds || []), card._id];
    board.columns.set(targetColumnId, col);
    board.markModified('columns');
    await board.save();
  }

  if (projectId) {
    Activity.create({
      projectId,
      boardId,
      cardId: card._id,
      type: 'card_created',
      action: `created card "${title}"`,
      user: { id: userId || null, name: authorName || 'Unknown' },
      metadata: { cardId: card._id, cardTitle: title },
      timestamp: new Date(),
    }).catch((e) => console.error('Activity log failed:', e));
  }

  return formatCard(card.toObject());
};

exports.updateCard = async (cardId, updates) => {
  const allowed = ['title', 'description', 'assignee', 'labels', 'dueDate'];
  const safeUpdates = {};
  if (updates.title !== undefined) safeUpdates.title = updates.title;
  if (updates.description !== undefined) safeUpdates.description = updates.description;
  if (updates.assignee !== undefined) safeUpdates.assigneeName = updates.assignee;
  if (updates.labels !== undefined) safeUpdates.labels = updates.labels;
  if (updates.dueDate !== undefined) safeUpdates.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;

  const card = await Card.findByIdAndUpdate(cardId, safeUpdates, { new: true });
  if (!card) throw new AppError('Card not found.', 404);
  return formatCard(card.toObject());
};

exports.moveCard = async (cardId, { fromColumnId, toColumnId, newIndex }) => {
  const card = await Card.findById(cardId);
  if (!card) throw new AppError('Card not found.', 404);

  const board = await KanbanBoard.findById(card.boardId);
  if (!board) throw new AppError('Board not found.', 404);

  // Remove from source column
  if (board.columns.has(fromColumnId)) {
    const srcCol = board.columns.get(fromColumnId);
    srcCol.cardIds = (srcCol.cardIds || []).filter((id) => id.toString() !== cardId);
    board.columns.set(fromColumnId, srcCol);
  }

  // Add to destination column at specified index
  if (board.columns.has(toColumnId)) {
    const dstCol = board.columns.get(toColumnId);
    const ids = (dstCol.cardIds || []).filter((id) => id.toString() !== cardId);
    ids.splice(newIndex ?? ids.length, 0, card._id);
    dstCol.cardIds = ids;
    board.columns.set(toColumnId, dstCol);
  }

  board.markModified('columns');
  await board.save();

  card.columnId = toColumnId;
  card.order = newIndex ?? 0;
  await card.save();

  return formatCard(card.toObject());
};

exports.deleteCard = async (cardId) => {
  const card = await Card.findByIdAndDelete(cardId);
  if (!card) throw new AppError('Card not found.', 404);

  // Remove from board column
  const board = await KanbanBoard.findById(card.boardId);
  if (board && board.columns.has(card.columnId)) {
    const col = board.columns.get(card.columnId);
    col.cardIds = (col.cardIds || []).filter((id) => id.toString() !== cardId);
    board.columns.set(card.columnId, col);
    board.markModified('columns');
    await board.save();
  }

  return { message: 'Card deleted successfully.' };
};
