// models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanBoard', index: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
  type: {
    type: String,
    required: true,
    enum: [
      'card_created', 'card_updated', 'card_moved', 'card_deleted',
      'board_created', 'board_updated', 'board_deleted',
      'document_created', 'document_updated', 'document_deleted',
      'user_mention',
    ],
  },
  action: { type: String, required: true },
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    username: { type: String },
  },
  mentionedUsers: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    username: String,
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  timestamp: { type: Date, default: Date.now, index: true },
}, {
  timestamps: true,
});

activitySchema.index({ projectId: 1, timestamp: -1 });
activitySchema.index({ boardId: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
