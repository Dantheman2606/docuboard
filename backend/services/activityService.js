// services/activityService.js
const Activity = require('../models/Activity');
const AppError = require('../utils/AppError');

const formatActivity = (a) => ({
  id: a._id.toString(),
  projectId: a.projectId.toString(),
  boardId: a.boardId ? a.boardId.toString() : null,
  cardId: a.cardId ? a.cardId.toString() : null,
  type: a.type,
  action: a.action,
  user: {
    id: a.user && a.user.id ? a.user.id.toString() : null,
    name: a.user ? a.user.name : 'Unknown',
    username: a.user ? a.user.username : undefined,
  },
  metadata: a.metadata ? Object.fromEntries(a.metadata) : {},
  timestamp: a.timestamp,
});

exports.getActivitiesByProject = async (projectId, { limit = 50, offset = 0, boardId } = {}) => {
  const query = { projectId };
  if (boardId) query.boardId = boardId;
  const activities = await Activity.find(query)
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));
  return activities.map(formatActivity);
};

exports.getActivitiesByBoard = async (boardId, { limit = 50, offset = 0 } = {}) => {
  const activities = await Activity.find({ boardId })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));
  return activities.map(formatActivity);
};

exports.logActivity = async (data) => {
  const activity = new Activity({
    projectId: data.projectId,
    boardId: data.boardId || null,
    cardId: data.cardId || null,
    type: data.type,
    action: data.action,
    user: data.user || { name: 'Unknown User' },
    metadata: data.metadata ? new Map(Object.entries(data.metadata)) : new Map(),
    timestamp: data.timestamp || new Date(),
  });
  await activity.save();
  return formatActivity(activity.toObject());
};

exports.cleanupActivities = async (projectId, daysOld = 90) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(daysOld));
  const result = await Activity.deleteMany({ projectId, timestamp: { $lt: cutoff } });
  return { deletedCount: result.deletedCount };
};
