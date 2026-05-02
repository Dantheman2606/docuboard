// routes/documents.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const documentService = require('../services/documentService');
const { success } = require('../utils/apiResponse');

router.use(authenticate);

// GET /api/documents/project/:projectId
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const docs = await documentService.getDocumentsByProject(req.params.projectId);
    return success(res, docs);
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await documentService.getDocumentById(req.params.id);
    return success(res, doc);
  } catch (err) {
    next(err);
  }
});

// POST /api/documents
router.post('/', async (req, res, next) => {
  try {
    const doc = await documentService.createDocument({
      title: req.body.title,
      content: req.body.content,
      projectId: req.body.projectId,
      createdBy: req.user.id,
      authorName: req.user.username,
    });
    return success(res, doc, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/documents/:id
router.put('/:id', async (req, res, next) => {
  try {
    const doc = await documentService.updateDocument(req.params.id, req.body, req.user.id, req.user.username);
    return success(res, doc);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await documentService.deleteDocument(req.params.id, req.user.id, req.user.username);
    return success(res, result);
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/:id/versions
router.post('/:id/versions', async (req, res, next) => {
  try {
    const version = await documentService.createVersion(req.params.id, {
      content: req.body.content,
      authorId: req.user.id,
      authorName: req.body.author || req.user.username,
      description: req.body.description,
    });
    return success(res, version, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id/versions
router.get('/:id/versions', async (req, res, next) => {
  try {
    const versions = await documentService.getVersions(req.params.id);
    return success(res, versions);
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id/versions/:versionNumber
router.get('/:id/versions/:versionNumber', async (req, res, next) => {
  try {
    const version = await documentService.getVersion(req.params.id, req.params.versionNumber);
    return success(res, version);
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/:id/versions/:versionNumber/restore
router.post('/:id/versions/:versionNumber/restore', async (req, res, next) => {
  try {
    const doc = await documentService.restoreVersion(
      req.params.id,
      req.params.versionNumber,
      req.user.id,
      req.user.username
    );
    return success(res, doc);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
