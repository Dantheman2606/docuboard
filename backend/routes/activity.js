// routes/activity.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const activityService = require('../services/activityService');
const { success } = require('../utils/apiResponse');

router.use(authenticate);

// GET /api/activity/project/:projectId
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const activities = await activityService.getActivitiesByProject(req.params.projectId, req.query);
    return success(res, activities);
  } catch (err) {
    next(err);
  }
});

// GET /api/activity/board/:boardId
router.get('/board/:boardId', async (req, res, next) => {
  try {
    const activities = await activityService.getActivitiesByBoard(req.params.boardId, req.query);
    return success(res, activities);
  } catch (err) {
    next(err);
  }
});

// POST /api/activity
router.post('/', async (req, res, next) => {
  try {
    const activity = await activityService.logActivity({
      ...req.body,
      user: req.body.user || { id: req.user.id, name: req.user.username },
    });
    return success(res, activity, 201);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/activity/cleanup/:projectId
router.delete('/cleanup/:projectId', async (req, res, next) => {
  try {
    const result = await activityService.cleanupActivities(req.params.projectId, req.query.daysOld);
    return success(res, result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
