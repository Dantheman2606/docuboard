// models/Card.js
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assigneeName: { type: String, default: '' }, // denormalized for display
  labels: [{ type: String }],
  dueDate: { type: Date, default: null },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanBoard', required: true, index: true },
  columnId: { type: String, required: true },
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

cardSchema.index({ boardId: 1, columnId: 1, order: 1 });

module.exports = mongoose.model('Card', cardSchema);
