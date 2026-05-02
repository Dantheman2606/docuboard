// services/kanbanService.js
const KanbanBoard = require('../models/KanbanBoard');
const Card = require('../models/Card');
const AppError = require('../utils/AppError');

/**
 * Serialize a board and its cards into the legacy API shape the frontend expects.
 * columns: { [colId]: { id, title, cardIds: [stringId] } }
 * cards:   { [cardId]: { id, title, description, assignee, labels, dueDate } }
 */
const formatBoard = async (board) => {
  const cards = await Card.find({ boardId: board._id }).lean();

  const cardsMap = {};
  cards.forEach((c) => {
    cardsMap[c._id.toString()] = {
      id: c._id.toString(),
      title: c.title,
      description: c.description || '',
      assignee: c.assigneeName || '',
      labels: c.labels || [],
      dueDate: c.dueDate ? c.dueDate.toISOString().split('T')[0] : null,
    };
  });

  const columnsObj = {};
  if (board.columns) {
    for (const [key, col] of board.columns) {
      columnsObj[key] = {
        id: col.id,
        title: col.title,
        cardIds: (col.cardIds || []).map((id) => id.toString()),
      };
    }
  }

  return {
    id: board._id.toString(),
    name: board.name,
    projectId: board.projectId.toString(),
    columns: columnsObj,
    cards: cardsMap,
    columnOrder: board.columnOrder || [],
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
  };
};

exports.formatBoard = formatBoard;

exports.getBoardsByProject = async (projectId) => {
  const boards = await KanbanBoard.find({ projectId }).sort({ createdAt: 1 });
  return Promise.all(boards.map(formatBoard));
};

exports.getBoardById = async (boardId) => {
  const board = await KanbanBoard.findById(boardId);
  if (!board) throw new AppError('Board not found.', 404);
  return formatBoard(board);
};

exports.createBoard = async ({ name, projectId, columnOrder, columns }) => {
  const defaultColumns = new Map([
    ['todo',       { id: 'todo',       title: 'To Do',       cardIds: [] }],
    ['inprogress', { id: 'inprogress', title: 'In Progress', cardIds: [] }],
    ['done',       { id: 'done',       title: 'Done',        cardIds: [] }],
  ]);

  let columnsMap = defaultColumns;
  if (columns) {
    columnsMap = new Map(
      Object.entries(columns).map(([k, v]) => [k, { id: v.id || k, title: v.title, cardIds: [] }])
    );
  }

  const board = new KanbanBoard({
    name: name || 'New Board',
    projectId,
    columns: columnsMap,
    columnOrder: columnOrder || ['todo', 'inprogress', 'done'],
  });
  await board.save();
  return formatBoard(board);
};

exports.updateBoard = async (boardId, updates) => {
  const board = await KanbanBoard.findById(boardId);
  if (!board) throw new AppError('Board not found.', 404);

  if (updates.name !== undefined) board.name = updates.name;
  if (updates.columnOrder !== undefined) board.columnOrder = updates.columnOrder;

  if (updates.columns) {
    const newMap = new Map();
    for (const [key, col] of Object.entries(updates.columns)) {
      // Resolve cardIds: keep ObjectId refs for valid cards, skip legacy strings
      const cardIds = (col.cardIds || [])
        .map((id) => {
          try { return require('mongoose').Types.ObjectId.createFromHexString(id.toString()); }
          catch { return null; }
        })
        .filter(Boolean);
      newMap.set(key, { id: col.id || key, title: col.title, cardIds });
    }
    board.columns = newMap;
  }

  await board.save();

  // Handle inline card upserts if the legacy client sends cards as a map
  if (updates.cards) {
    for (const [cardId, cardData] of Object.entries(updates.cards)) {
      // Try to find existing card by _id
      let card = null;
      try {
        card = await Card.findById(cardId);
      } catch (_) {}

      if (card) {
        Object.assign(card, {
          title: cardData.title || card.title,
          description: cardData.description ?? card.description,
          assigneeName: cardData.assignee ?? card.assigneeName,
          labels: cardData.labels ?? card.labels,
          dueDate: cardData.dueDate ? new Date(cardData.dueDate) : card.dueDate,
        });
        await card.save();
      } else {
        // New card — find which column it belongs to
        let columnId = 'todo';
        if (board.columns) {
          for (const [k, col] of board.columns) {
            if ((col.cardIds || []).some((id) => id.toString() === cardId)) {
              columnId = k;
              break;
            }
          }
        }
        await Card.create({
          title: cardData.title || 'Untitled',
          description: cardData.description || '',
          assigneeName: cardData.assignee || '',
          labels: cardData.labels || [],
          dueDate: cardData.dueDate ? new Date(cardData.dueDate) : null,
          boardId: board._id,
          columnId,
        });
      }
    }
  }

  return formatBoard(await KanbanBoard.findById(boardId));
};

exports.deleteBoard = async (boardId) => {
  const board = await KanbanBoard.findByIdAndDelete(boardId);
  if (!board) throw new AppError('Board not found.', 404);
  await Card.deleteMany({ boardId: board._id });
  return { message: 'Board deleted successfully.' };
};
