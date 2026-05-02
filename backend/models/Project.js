// models/Project.js
const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: ['owner', 'admin', 'editor', 'viewer'],
    default: 'viewer',
    required: true,
  },
  addedAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  color: { type: String, default: '#3B82F6' },
  members: [projectMemberSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

// Indexes for efficient member look-ups
projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Project', projectSchema);
