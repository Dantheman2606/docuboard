// models/Document.js
const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  author: { type: String, required: true },
  description: { type: String, default: '' }
});

const documentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  projectId: { type: String, required: true, ref: 'Project' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  versions: [versionSchema]
});

module.exports = mongoose.model('Document', documentSchema);
