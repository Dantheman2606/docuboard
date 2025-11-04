// routes/activity.js
const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Get activities for a specific project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { limit = 50, offset = 0, boardId } = req.query;
    
    const query = { projectId: req.params.projectId };
    if (boardId) {
      query.boardId = boardId;
    }
    
    const activities = await Activity.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activities for a specific board
router.get('/board/:boardId', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const activities = await Activity.find({ boardId: req.params.boardId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new activity
router.post('/', async (req, res) => {
  try {
    const activityId = req.body.id || `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const activity = new Activity({
      id: activityId,
      projectId: req.body.projectId,
      boardId: req.body.boardId,
      cardId: req.body.cardId,
      type: req.body.type,
      action: req.body.action,
      user: req.body.user || { name: 'Unknown User' },
      metadata: req.body.metadata || {},
      timestamp: req.body.timestamp || new Date()
    });
    
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete old activities (cleanup)
router.delete('/cleanup/:projectId', async (req, res) => {
  try {
    const { daysOld = 90 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));
    
    const result = await Activity.deleteMany({
      projectId: req.params.projectId,
      timestamp: { $lt: cutoffDate }
    });
    
    res.json({ 
      message: 'Old activities deleted',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
