// models/Document.js
const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: 'Unknown' }, // denormalized for display
  description: { type: String, default: '' },
});

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  versions: [versionSchema],
}, {
  timestamps: true,
});

documentSchema.index({ projectId: 1, updatedAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
