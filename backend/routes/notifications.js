// routes/notifications.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const { success } = require('../utils/apiResponse');

router.use(authenticate);

// GET /api/notifications/user/:userId
router.get('/user/:userId', async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotificationsByUser(req.params.userId, req.query);
    return success(res, notifications);
  } catch (err) {
    next(err);
  }
});

// GET /api/notifications/user/:userId/unread-count
router.get('/user/:userId/unread-count', async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.params.userId);
    return success(res, { count });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/user/:userId/read-all
router.patch('/user/:userId/read-all', async (req, res, next) => {
  try {
    const result = await notificationService.markAllRead(req.params.userId);
    return success(res, result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:notificationId/read
router.patch('/:notificationId/read', async (req, res, next) => {
  try {
    const notification = await notificationService.markRead(req.params.notificationId);
    return success(res, notification);
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications
router.post('/', async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(req.body);
    return success(res, notification, 201);
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/create-mentions
router.post('/create-mentions', async (req, res, next) => {
  try {
    const result = await notificationService.createMentionNotifications(req.body);
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notifications/:notificationId
router.delete('/:notificationId', async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(req.params.notificationId);
    return success(res, result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
