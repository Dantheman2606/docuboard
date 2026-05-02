// services/documentService.js
const Document = require('../models/Document');
const Activity = require('../models/Activity');
const AppError = require('../utils/AppError');

const formatDocument = (doc) => ({
  id: doc._id.toString(),
  title: doc.title,
  content: doc.content,
  projectId: doc.projectId.toString(),
  createdBy: doc.createdBy ? doc.createdBy.toString() : null,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  versions: (doc.versions || []).map((v) => ({
    versionNumber: v.versionNumber,
    content: v.content,
    timestamp: v.timestamp,
    author: v.author ? v.author.toString() : null,
    authorName: v.authorName,
    description: v.description,
    _id: v._id ? v._id.toString() : undefined,
  })),
});

exports.formatDocument = formatDocument;

exports.getDocumentsByProject = async (projectId) => {
  const docs = await Document.find({ projectId }).sort({ updatedAt: -1 }).lean();
  return docs.map(formatDocument);
};

exports.getDocumentById = async (docId) => {
  const doc = await Document.findById(docId).lean();
  if (!doc) throw new AppError('Document not found.', 404);
  return formatDocument(doc);
};

exports.createDocument = async ({ title, content, projectId, createdBy, authorName }) => {
  const doc = new Document({
    title,
    content: content || '',
    projectId,
    createdBy: createdBy || null,
  });
  await doc.save();

  // Log activity (fire-and-forget)
  Activity.create({
    projectId,
    type: 'document_created',
    action: `created document "${title}"`,
    user: { id: createdBy || null, name: authorName || 'Unknown' },
    metadata: { documentId: doc._id, documentTitle: title },
    timestamp: new Date(),
  }).catch((e) => console.error('Activity log failed:', e));

  return formatDocument(doc.toObject());
};

exports.updateDocument = async (docId, updates, userId, authorName) => {
  const allowed = ['title', 'content'];
  const safeUpdates = {};
  allowed.forEach((k) => { if (updates[k] !== undefined) safeUpdates[k] = updates[k]; });

  const doc = await Document.findByIdAndUpdate(docId, safeUpdates, { new: true });
  if (!doc) throw new AppError('Document not found.', 404);

  Activity.create({
    projectId: doc.projectId,
    type: 'document_updated',
    action: `updated document "${doc.title}"`,
    user: { id: userId || null, name: authorName || 'Unknown' },
    metadata: { documentId: doc._id, documentTitle: doc.title },
    timestamp: new Date(),
  }).catch((e) => console.error('Activity log failed:', e));

  return formatDocument(doc.toObject());
};

exports.deleteDocument = async (docId, userId, authorName) => {
  const doc = await Document.findByIdAndDelete(docId);
  if (!doc) throw new AppError('Document not found.', 404);

  Activity.create({
    projectId: doc.projectId,
    type: 'document_deleted',
    action: `deleted document "${doc.title}"`,
    user: { id: userId || null, name: authorName || 'Unknown' },
    metadata: { documentId: doc._id, documentTitle: doc.title },
    timestamp: new Date(),
  }).catch((e) => console.error('Activity log failed:', e));

  return { message: 'Document deleted successfully.' };
};

exports.createVersion = async (docId, { content, authorId, authorName, description }) => {
  const doc = await Document.findById(docId);
  if (!doc) throw new AppError('Document not found.', 404);

  const versionNumber = doc.versions.length + 1;
  const newVersion = {
    versionNumber,
    content: content || doc.content,
    timestamp: new Date(),
    author: authorId || null,
    authorName: authorName || 'Unknown',
    description: description || `Version ${versionNumber}`,
  };

  doc.versions.push(newVersion);
  await doc.save();

  Activity.create({
    projectId: doc.projectId,
    type: 'document_updated',
    action: `saved version ${versionNumber} of "${doc.title}"`,
    user: { id: authorId || null, name: authorName || 'Unknown' },
    metadata: { documentId: doc._id, versionNumber },
    timestamp: new Date(),
  }).catch((e) => console.error('Activity log failed:', e));

  return newVersion;
};

exports.getVersions = async (docId) => {
  const doc = await Document.findById(docId).lean();
  if (!doc) throw new AppError('Document not found.', 404);
  return [...(doc.versions || [])].sort((a, b) => b.versionNumber - a.versionNumber);
};

exports.getVersion = async (docId, versionNumber) => {
  const doc = await Document.findById(docId).lean();
  if (!doc) throw new AppError('Document not found.', 404);
  const version = (doc.versions || []).find((v) => v.versionNumber === parseInt(versionNumber));
  if (!version) throw new AppError('Version not found.', 404);
  return version;
};

exports.restoreVersion = async (docId, versionNumber, userId, authorName) => {
  const doc = await Document.findById(docId);
  if (!doc) throw new AppError('Document not found.', 404);
  const version = (doc.versions || []).find((v) => v.versionNumber === parseInt(versionNumber));
  if (!version) throw new AppError('Version not found.', 404);

  doc.content = version.content;
  await doc.save();

  Activity.create({
    projectId: doc.projectId,
    type: 'document_updated',
    action: `restored "${doc.title}" to version ${versionNumber}`,
    user: { id: userId || null, name: authorName || 'Unknown' },
    metadata: { documentId: doc._id, versionNumber },
    timestamp: new Date(),
  }).catch((e) => console.error('Activity log failed:', e));

  return formatDocument(doc.toObject());
};
