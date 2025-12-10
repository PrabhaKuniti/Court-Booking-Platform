const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create or get user (for demo purposes)
router.post('/create', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({ name, email, phone });
      await user.save();
    }
    
    res.json({ userId: user._id, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

