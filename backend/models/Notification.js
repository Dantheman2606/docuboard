// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['mention', 'comment', 'assignment', 'system']
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    projectId: String,
    documentId: String,
    boardId: String,
    cardId: String,
    mentionedBy: {
      id: String,
      name: String,
      username: String
    },
    context: String // A snippet of text where the mention occurred
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
notificationSchema.index({ userId: 1, read: 1, timestamp: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
