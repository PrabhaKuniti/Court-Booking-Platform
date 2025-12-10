const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Court routes
router.get('/courts', adminController.getCourts);
router.post('/courts', adminController.createCourt);
router.put('/courts/:id', adminController.updateCourt);
router.delete('/courts/:id', adminController.deleteCourt);

// Equipment routes
router.get('/equipment', adminController.getEquipment);
router.post('/equipment', adminController.createEquipment);
router.put('/equipment/:id', adminController.updateEquipment);

// Coach routes
router.get('/coaches', adminController.getCoaches);
router.post('/coaches', adminController.createCoach);
router.put('/coaches/:id', adminController.updateCoach);

// Pricing rule routes
router.get('/pricing-rules', adminController.getPricingRules);
router.post('/pricing-rules', adminController.createPricingRule);
router.put('/pricing-rules/:id', adminController.updatePricingRule);
router.patch('/pricing-rules/:id/toggle', adminController.togglePricingRule);
router.delete('/pricing-rules/:id', adminController.deletePricingRule);

module.exports = router;

