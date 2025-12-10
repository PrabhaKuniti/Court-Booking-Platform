const express = require('express');
const router = express.Router();
const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');

// Public routes for fetching available resources
router.get('/courts', async (req, res) => {
  try {
    const courts = await Court.find({ isActive: true });
    res.json(courts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/equipment', async (req, res) => {
  try {
    const equipment = await Equipment.find({ isActive: true });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/coaches', async (req, res) => {
  try {
    const coaches = await Coach.find({ isActive: true });
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

