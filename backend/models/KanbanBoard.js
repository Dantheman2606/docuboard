// models/KanbanBoard.js
const mongoose = require('mongoose');

const kanbanBoardSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true, ref: 'Project' },
  columns: {
    type: Map,
    of: {
      id: String,
      title: String,
      cardIds: [String]
    }
  },
  cards: {
    type: Map,
    of: {
      id: String,
      title: String,
      description: String,
      assignee: String,
      labels: [String],
      dueDate: String
    }
  },
  columnOrder: [String],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('KanbanBoard', kanbanBoardSchema);
