// routes/users.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const userService = require('../services/userService');
const { success } = require('../utils/apiResponse');

router.use(authenticate);

// GET /api/users/search?query=...
router.get('/search', async (req, res, next) => {
  try {
    const users = await userService.searchUsers(req.query.query || '', 10);
    return success(res, users.map((u) => ({
      id: u._id.toString(),
      _id: u._id.toString(),
      username: u.username,
      name: u.name,
    })));
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    return success(res, userService.formatUser(user));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
