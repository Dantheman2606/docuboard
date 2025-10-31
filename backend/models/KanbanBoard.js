// models/KanbanBoard.js
const mongoose = require('mongoose');

const kanbanBoardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  projectId: { type: String, required: true, ref: 'Project' },
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index for projectId (not unique anymore)
kanbanBoardSchema.index({ projectId: 1 });

module.exports = mongoose.model('KanbanBoard', kanbanBoardSchema);
