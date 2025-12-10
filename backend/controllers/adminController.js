const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');
const PricingRule = require('../models/PricingRule');

// Court Management
exports.getCourts = async (req, res) => {
  try {
    const courts = await Court.find();
    res.json(courts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCourt = async (req, res) => {
  try {
    const { name, type, basePrice } = req.body;
    const court = new Court({ name, type, basePrice });
    await court.save();
    res.status(201).json(court);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourt = async (req, res) => {
  try {
    const { id } = req.params;
    const court = await Court.findByIdAndUpdate(id, req.body, { new: true });
    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }
    res.json(court);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCourt = async (req, res) => {
  try {
    const { id } = req.params;
    const court = await Court.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }
    res.json({ message: 'Court disabled', court });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Equipment Management
exports.getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEquipment = async (req, res) => {
  try {
    const { name, type, totalStock, rentalPrice } = req.body;
    const equipment = new Equipment({ name, type, totalStock, rentalPrice });
    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByIdAndUpdate(id, req.body, { new: true });
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Coach Management
exports.getCoaches = async (req, res) => {
  try {
    const coaches = await Coach.find();
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCoach = async (req, res) => {
  try {
    const coach = new Coach(req.body);
    await coach.save();
    res.status(201).json(coach);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const coach = await Coach.findByIdAndUpdate(id, req.body, { new: true });
    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }
    res.json(coach);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pricing Rule Management
exports.getPricingRules = async (req, res) => {
  try {
    const rules = await PricingRule.find().sort({ createdAt: -1 });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPricingRule = async (req, res) => {
  try {
    const rule = new PricingRule(req.body);
    await rule.save();
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePricingRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await PricingRule.findByIdAndUpdate(id, req.body, { new: true });
    if (!rule) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.togglePricingRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await PricingRule.findById(id);
    if (!rule) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }
    rule.isActive = !rule.isActive;
    await rule.save();
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePricingRule = async (req, res) => {
  try {
    const { id } = req.params;
    await PricingRule.findByIdAndDelete(id);
    res.json({ message: 'Pricing rule deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

