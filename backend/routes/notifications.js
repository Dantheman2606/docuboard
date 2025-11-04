// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;
    
    const query = { userId: req.params.userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread notification count
router.get('/user/:userId/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.params.userId,
      read: false 
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { id: req.params.notificationId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new notification (typically called when a user is mentioned)
router.post('/', async (req, res) => {
  try {
    const notificationId = req.body.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const notification = new Notification({
      id: notificationId,
      userId: req.body.userId,
      type: req.body.type || 'mention',
      message: req.body.message,
      read: false,
      metadata: req.body.metadata || {},
      timestamp: req.body.timestamp || new Date()
    });
    
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notifications for mentioned users
router.post('/create-mentions', async (req, res) => {
  try {
    const { mentionedUsernames, mentionedBy, context, projectId, documentId, boardId, cardId } = req.body;
    
    if (!mentionedUsernames || !Array.isArray(mentionedUsernames) || mentionedUsernames.length === 0) {
      return res.status(400).json({ error: 'mentionedUsernames array is required' });
    }
    
    if (!mentionedBy || !mentionedBy.username) {
      return res.status(400).json({ error: 'mentionedBy information is required' });
    }
    
    // Find all mentioned users
    const users = await User.find({ username: { $in: mentionedUsernames } });
    
    if (users.length === 0) {
      return res.json({ message: 'No valid users found', notificationsCreated: 0 });
    }
    
    // Create notifications for each user
    const notifications = users.map(user => {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Construct a meaningful message
      let message = `${mentionedBy.name} mentioned you`;
      if (documentId) {
        message += ' in a document';
      } else if (cardId) {
        message += ' in a kanban card';
      }
      
      return new Notification({
        id: notificationId,
        userId: user._id.toString(),
        type: 'mention',
        message,
        read: false,
        metadata: {
          projectId,
          documentId,
          boardId,
          cardId,
          mentionedBy: {
            id: mentionedBy.id,
            name: mentionedBy.name,
            username: mentionedBy.username
          },
          context: context || ''
        },
        timestamp: new Date()
      });
    });
    
    await Notification.insertMany(notifications);
    
    res.status(201).json({ 
      message: `Created ${notifications.length} notification(s)`,
      notificationsCreated: notifications.length,
      notifications 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ id: req.params.notificationId });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (for mention autocomplete)
router.get('/users/search', async (req, res) => {
  try {
    const { query = '' } = req.query;
    
    const searchQuery = query ? {
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    } : {};
    
    const users = await User.find(searchQuery)
      .select('username name _id')
      .limit(10);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
