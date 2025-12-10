const Booking = require('../models/Booking');
const User = require('../models/User');
const Waitlist = require('../models/Waitlist');
const { calculatePrice } = require('../utils/priceCalculator');
const { checkMultiResourceAvailability } = require('../utils/availabilityChecker');

/**
 * Get all bookings for a user
 */
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ user: userId })
      .populate('court', 'name type')
      .populate('resources.coach', 'name')
      .sort({ startTime: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get available time slots for a specific date and court
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { courtId, date } = req.query;
    
    if (!courtId || !date) {
      return res.status(400).json({ error: 'Court ID and date are required' });
    }

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all bookings for this court on this date
    const bookings = await Booking.find({
      court: courtId,
      status: 'confirmed',
      $or: [
        { startTime: { $gte: startOfDay, $lte: endOfDay } },
        { endTime: { $gte: startOfDay, $lte: endOfDay } },
        { startTime: { $lte: startOfDay }, endTime: { $gte: endOfDay } },
      ],
    }).sort({ startTime: 1 });

    // Generate time slots (9 AM to 10 PM, 1-hour slots)
    const slots = [];
    for (let hour = 9; hour < 22; hour++) {
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(selectedDate);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Check if this slot is booked
      const isBooked = bookings.some(booking => {
        return (slotStart < booking.endTime && slotEnd > booking.startTime);
      });

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        available: !isBooked,
      });
    }

    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Calculate price for a booking (before confirmation)
 */
exports.calculateBookingPrice = async (req, res) => {
  try {
    const { courtId, startTime, endTime, rackets = 0, shoes = 0, coachId = null } = req.body;

    if (!courtId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Court ID, start time, and end time are required' });
    }

    const priceBreakdown = await calculatePrice(
      courtId,
      new Date(startTime),
      new Date(endTime),
      { rackets: parseInt(rackets), shoes: parseInt(shoes) },
      coachId
    );

    res.json(priceBreakdown);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new booking (atomic transaction)
 */
exports.createBooking = async (req, res) => {
  const session = await Booking.db.startSession();
  session.startTransaction();

  try {
    const { userId, courtId, startTime, endTime, rackets = 0, shoes = 0, coachId = null } = req.body;

    if (!userId || !courtId || !startTime || !endTime) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check availability of all resources
    const availability = await checkMultiResourceAvailability(
      courtId,
      start,
      end,
      { rackets: parseInt(rackets), shoes: parseInt(shoes), coach: coachId }
    );

    if (!availability.allAvailable) {
      await session.abortTransaction();
      return res.status(409).json({
        error: 'Resources not available',
        availability,
      });
    }

    // Calculate price
    const pricingBreakdown = await calculatePrice(
      courtId,
      start,
      end,
      { rackets: parseInt(rackets), shoes: parseInt(shoes) },
      coachId
    );

    // Create booking
    const booking = new Booking({
      user: userId,
      court: courtId,
      startTime: start,
      endTime: end,
      resources: {
        rackets: parseInt(rackets),
        shoes: parseInt(shoes),
        coach: coachId || null,
      },
      status: 'confirmed',
      pricingBreakdown,
    });

    await booking.save({ session });

    await session.commitTransaction();
    await booking.populate('court', 'name type');
    await booking.populate('resources.coach', 'name');

    res.status(201).json(booking);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

/**
 * Cancel a booking and notify waitlist
 */
exports.cancelBooking = async (req, res) => {
  const session = await Booking.db.startSession();
  session.startTransaction();

  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save({ session });

    // Check waitlist for this slot
    const waitlistEntries = await Waitlist.find({
      court: booking.court,
      preferredStartTime: { $lte: booking.endTime },
      preferredEndTime: { $gte: booking.startTime },
      notified: false,
    })
      .sort({ position: 1 })
      .populate('user')
      .session(session);

    // Notify first person in waitlist (in a real app, this would send email/SMS)
    if (waitlistEntries.length > 0) {
      const nextInLine = waitlistEntries[0];
      nextInLine.notified = true;
      await nextInLine.save({ session });
      
      // In production, you would send a notification here
      console.log(`Waitlist notification: User ${nextInLine.user.email} can now book this slot`);
    }

    await session.commitTransaction();
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

/**
 * Add user to waitlist
 */
exports.addToWaitlist = async (req, res) => {
  try {
    const { userId, courtId, startTime, endTime, rackets = 0, shoes = 0, coachId = null } = req.body;

    // Check current waitlist position
    const existingWaitlist = await Waitlist.find({
      court: courtId,
      preferredStartTime: { $lte: new Date(endTime) },
      preferredEndTime: { $gte: new Date(startTime) },
    }).sort({ position: -1 });

    const position = existingWaitlist.length > 0 
      ? existingWaitlist[0].position + 1 
      : 1;

    const waitlistEntry = new Waitlist({
      user: userId,
      court: courtId,
      preferredStartTime: new Date(startTime),
      preferredEndTime: new Date(endTime),
      resources: {
        rackets: parseInt(rackets),
        shoes: parseInt(shoes),
        coach: coachId || null,
      },
      position,
    });

    await waitlistEntry.save();
    res.status(201).json(waitlistEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

