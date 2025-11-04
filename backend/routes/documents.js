// routes/documents.js
const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const Activity = require('../models/Activity');

// Get documents by project
router.get('/project/:projectId', async (req, res) => {
  try {
    const documents = await Document.find({ projectId: req.params.projectId })
      .sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single document
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findOne({ id: req.params.id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create document
router.post('/', async (req, res) => {
  try {
    const document = new Document({
      id: req.body.id || `doc_${Date.now()}`,
      title: req.body.title,
      content: req.body.content || '',
      projectId: req.body.projectId,
      updatedAt: new Date()
    });
    await document.save();

    // Log activity for document creation
    try {
      const activity = new Activity({
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: document.projectId,
        type: 'document_created',
        action: `created document "${document.title}"`,
        user: {
          name: req.body.author || 'Unknown User'
        },
        metadata: {
          documentId: document.id,
          documentTitle: document.title
        },
        timestamp: new Date()
      });
      await activity.save();
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update document
router.put('/:id', async (req, res) => {
  try {
    const document = await Document.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({ id: req.params.id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Log activity for document deletion
    try {
      const activity = new Activity({
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: document.projectId,
        type: 'document_deleted',
        action: `deleted document "${document.title}"`,
        user: {
          name: req.body.author || 'Unknown User'
        },
        metadata: {
          documentId: document.id,
          documentTitle: document.title
        },
        timestamp: new Date()
      });
      await activity.save();
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== VERSION MANAGEMENT ROUTES =====

// Create a new version snapshot
router.post('/:id/versions', async (req, res) => {
  try {
    const document = await Document.findOne({ id: req.params.id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const versionNumber = document.versions.length + 1;
    const newVersion = {
      versionNumber,
      content: req.body.content || document.content,
      timestamp: new Date(),
      author: req.body.author || 'Unknown',
      description: req.body.description || `Version ${versionNumber}`
    };

    document.versions.push(newVersion);
    await document.save();

    // Log activity for version creation
    try {
      const activity = new Activity({
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: document.projectId,
        type: 'document_updated',
        action: `saved version ${versionNumber} of document "${document.title}"`,
        user: {
          name: req.body.author || 'Unknown User'
        },
        metadata: {
          documentId: document.id,
          documentTitle: document.title,
          versionNumber: versionNumber,
          versionDescription: newVersion.description
        },
        timestamp: new Date()
      });
      await activity.save();
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
      // Don't fail the version creation if activity logging fails
    }

    res.status(201).json(newVersion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all versions for a document
router.get('/:id/versions', async (req, res) => {
  try {
    const document = await Document.findOne({ id: req.params.id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Return versions sorted by version number (descending)
    const versions = document.versions.sort((a, b) => b.versionNumber - a.versionNumber);
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific version
router.get('/:id/versions/:versionNumber', async (req, res) => {
  try {
    const document = await Document.findOne({ id: req.params.id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const version = document.versions.find(
      v => v.versionNumber === parseInt(req.params.versionNumber)
    );
    
    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json(version);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore a document to a specific version
router.post('/:id/versions/:versionNumber/restore', async (req, res) => {
  try {
    const document = await Document.findOne({ id: req.params.id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const version = document.versions.find(
      v => v.versionNumber === parseInt(req.params.versionNumber)
    );
    
    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Update document content to the version content
    document.content = version.content;
    document.updatedAt = new Date();
    await document.save();

    // Log activity for version restore
    try {
      const activity = new Activity({
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: document.projectId,
        type: 'document_updated',
        action: `restored document "${document.title}" to version ${version.versionNumber}`,
        user: {
          name: req.body.author || version.author || 'Unknown User'
        },
        metadata: {
          documentId: document.id,
          documentTitle: document.title,
          versionNumber: version.versionNumber,
          versionDescription: version.description
        },
        timestamp: new Date()
      });
      await activity.save();
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
      // Don't fail the restore if activity logging fails
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
