const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/user/:userId', bookingController.getUserBookings);
router.get('/slots', bookingController.getAvailableSlots);
router.post('/calculate-price', bookingController.calculateBookingPrice);
router.post('/', bookingController.createBooking);
router.post('/waitlist', bookingController.addToWaitlist);
router.patch('/:bookingId/cancel', bookingController.cancelBooking);

module.exports = router;

