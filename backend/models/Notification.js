// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    required: true,
    enum: ['mention', 'comment', 'assignment', 'system'],
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false, index: true },
  metadata: {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanBoard' },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
    mentionedBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      username: String,
    },
    context: String,
  },
  timestamp: { type: Date, default: Date.now, index: true },
}, {
  timestamps: true,
});

notificationSchema.index({ userId: 1, read: 1, timestamp: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
