// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Simple password comparison (not hashed for simplicity as requested)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return user data without password
    const userData = {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    res.json(userData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Create new user
    const newUser = new User({
      username,
      password, // Not hashing for simplicity as requested
      name,
      role: role || 'viewer',
    });

    await newUser.save();

    // Return user data without password
    const userData = {
      id: newUser._id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
    };

    res.status(201).json(userData);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Get current user info (optional - for checking if logged in)
router.get('/me', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
