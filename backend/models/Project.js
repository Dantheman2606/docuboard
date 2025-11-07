// models/Project.js
const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { 
    type: String, 
    enum: ['owner', 'admin', 'editor', 'viewer'],
    default: 'viewer',
    required: true
  },
  addedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#3B82F6' },
  docs: [{ type: String, ref: 'Document' }],
  members: [projectMemberSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
