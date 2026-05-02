// models/KanbanBoard.js
const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  id: { type: String, required: true }, // logical column key (e.g. 'todo')
  title: { type: String, required: true },
  cardIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
}, { _id: false });

const kanbanBoardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  columns: {
    type: Map,
    of: columnSchema,
  },
  columnOrder: [String],
}, {
  timestamps: true,
});

kanbanBoardSchema.index({ projectId: 1, createdAt: 1 });

module.exports = mongoose.model('KanbanBoard', kanbanBoardSchema);
