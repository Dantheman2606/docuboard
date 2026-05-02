// services/notificationService.js
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Safely convert a value to ObjectId.
 * Returns null (instead of throwing) if the value is not a valid 24-char hex ObjectId.
 * This prevents BSONErrors when legacy temp IDs (e.g. "c1777704262870") are passed in.
 */
const toObjectId = (id) => {
  if (!id) return null;
  try {
    return new mongoose.Types.ObjectId(id.toString());
  } catch {
    return null;
  }
};

const formatNotification = (n) => ({
  id: n._id.toString(),
  userId: n.userId.toString(),
  type: n.type,
  message: n.message,
  read: n.read,
  metadata: {
    projectId: n.metadata?.projectId ? n.metadata.projectId.toString() : null,
    documentId: n.metadata?.documentId ? n.metadata.documentId.toString() : null,
    boardId: n.metadata?.boardId ? n.metadata.boardId.toString() : null,
    cardId: n.metadata?.cardId ? n.metadata.cardId.toString() : null,
    mentionedBy: n.metadata?.mentionedBy
      ? {
          id: n.metadata.mentionedBy.id ? n.metadata.mentionedBy.id.toString() : null,
          name: n.metadata.mentionedBy.name,
          username: n.metadata.mentionedBy.username,
        }
      : null,
    context: n.metadata?.context || null,
  },
  timestamp: n.timestamp,
  createdAt: n.createdAt,
  updatedAt: n.updatedAt,
});

exports.getNotificationsByUser = async (userId, { limit = 50, offset = 0, unreadOnly = false } = {}) => {
  const query = { userId };
  if (unreadOnly === 'true' || unreadOnly === true) query.read = false;

  const notifications = await Notification.find(query)
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));
  return notifications.map(formatNotification);
};

exports.getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, read: false });
};

exports.markRead = async (notificationId) => {
  const n = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
  if (!n) throw new AppError('Notification not found.', 404);
  return formatNotification(n.toObject());
};

exports.markAllRead = async (userId) => {
  await Notification.updateMany({ userId, read: false }, { read: true });
  return { message: 'All notifications marked as read.' };
};

exports.createNotification = async (data) => {
  const n = new Notification({
    userId: data.userId,
    type: data.type || 'mention',
    message: data.message,
    read: false,
    metadata: data.metadata || {},
    timestamp: data.timestamp || new Date(),
  });
  await n.save();
  return formatNotification(n.toObject());
};

exports.createMentionNotifications = async ({
  mentionedUsernames, mentionedBy, context, projectId, documentId, boardId, cardId,
}) => {
  if (!mentionedUsernames?.length) throw new AppError('mentionedUsernames array is required.', 400);
  if (!mentionedBy?.username) throw new AppError('mentionedBy information is required.', 400);

  const users = await User.find({ username: { $in: mentionedUsernames } });
  if (!users.length) return { notificationsCreated: 0, notifications: [] };

  let message = `${mentionedBy.name} mentioned you`;
  if (documentId) message += ' in a document';
  else if (cardId) message += ' in a kanban card';

  // Safely convert all IDs — invalid/legacy temp IDs (e.g. "c1777704262870") become null
  const safeProjectId  = toObjectId(projectId);
  const safeDocumentId = toObjectId(documentId);
  const safeBoardId    = toObjectId(boardId);
  const safeCardId     = toObjectId(cardId);
  const safeMentionId  = toObjectId(mentionedBy.id);

  const notifications = users.map((user) => new Notification({
    userId: user._id,
    type: 'mention',
    message,
    read: false,
    metadata: {
      projectId:  safeProjectId,
      documentId: safeDocumentId,
      boardId:    safeBoardId,
      cardId:     safeCardId,
      mentionedBy: {
        id: safeMentionId,
        name: mentionedBy.name,
        username: mentionedBy.username,
      },
      context: context || '',
    },
    timestamp: new Date(),
  }));

  await Notification.insertMany(notifications);
  return {
    notificationsCreated: notifications.length,
    notifications: notifications.map((n) => formatNotification(n.toObject())),
  };
};

exports.deleteNotification = async (notificationId) => {
  const n = await Notification.findByIdAndDelete(notificationId);
  if (!n) throw new AppError('Notification not found.', 404);
  return { message: 'Notification deleted.' };
};
