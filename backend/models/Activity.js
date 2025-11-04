// models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  projectId: {
    type: String,
    required: true,
    index: true
  },
  boardId: {
    type: String,
    index: true
  },
  cardId: {
    type: String
  },
  type: {
    type: String,
    required: true,
    enum: [
      'card_created',
      'card_updated',
      'card_moved',
      'card_deleted',
      'board_created',
      'board_updated',
      'board_deleted',
      'document_created',
      'document_updated',
      'document_deleted',
      'user_mention'
    ]
  },
  action: {
    type: String,
    required: true
  },
  user: {
    id: String,
    name: String,
    username: String
  },
  mentionedUsers: [{
    id: String,
    name: String,
    username: String
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
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
activitySchema.index({ projectId: 1, timestamp: -1 });
activitySchema.index({ boardId: 1, timestamp: -1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
