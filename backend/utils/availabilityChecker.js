const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');

/**
 * Check if a court is available for the given time slot
 */
async function isCourtAvailable(courtId, startTime, endTime, excludeBookingId = null) {
  const query = {
    court: courtId,
    status: 'confirmed',
    $or: [
      // Case 1: Existing booking starts before and ends after our start time
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return !conflictingBooking;
}

/**
 * Check if a coach is available for the given time slot
 */
async function isCoachAvailable(coachId, startTime, endTime, excludeBookingId = null) {
  const coach = await Coach.findById(coachId);
  if (!coach || !coach.isActive) {
    return false;
  }

  // Check coach's availability schedule
  const bookingDate = new Date(startTime);
  const dayOfWeek = bookingDate.getDay();
  const [startH, startM] = [bookingDate.getHours(), bookingDate.getMinutes()];
  const [endH, endM] = [endTime.getHours(), endTime.getMinutes()];
  const bookingStartMinutes = startH * 60 + startM;
  const bookingEndMinutes = endH * 60 + endM;

  // Check if coach has availability for this day and time
  const availableSlot = coach.availability.find(slot => {
    if (slot.dayOfWeek !== dayOfWeek) return false;
    
    const [slotStartH, slotStartM] = slot.startTime.split(':').map(Number);
    const [slotEndH, slotEndM] = slot.endTime.split(':').map(Number);
    const slotStartMinutes = slotStartH * 60 + slotStartM;
    const slotEndMinutes = slotEndH * 60 + slotEndM;

    return bookingStartMinutes >= slotStartMinutes && bookingEndMinutes <= slotEndMinutes;
  });

  if (!availableSlot) {
    return false;
  }

  // Check if coach is already booked
  const query = {
    'resources.coach': coachId,
    status: 'confirmed',
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return !conflictingBooking;
}

/**
 * Check if equipment is available in sufficient quantity
 */
async function isEquipmentAvailable(equipmentType, quantity, startTime, endTime, excludeBookingId = null) {
  const equipment = await Equipment.findOne({ type: equipmentType, isActive: true });
  if (!equipment) {
    return false;
  }

  // Get all bookings that overlap with the requested time slot
  const query = {
    status: 'confirmed',
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlappingBookings = await Booking.find(query);

  // Calculate total booked quantity for this equipment type
  let totalBooked = 0;
  const fieldName = equipmentType === 'racket' ? 'rackets' : 'shoes';
  
  overlappingBookings.forEach(booking => {
    totalBooked += booking.resources[fieldName] || 0;
  });

  // Check if there's enough available
  const available = equipment.totalStock - totalBooked;
  return available >= quantity;
}

/**
 * Check availability of all resources for a booking
 */
async function checkMultiResourceAvailability(courtId, startTime, endTime, resources = {}, excludeBookingId = null) {
  const availability = {
    court: false,
    equipment: {
      rackets: false,
      shoes: false,
    },
    coach: null,
    allAvailable: false,
  };

  // Check court
  availability.court = await isCourtAvailable(courtId, startTime, endTime, excludeBookingId);
  if (!availability.court) {
    return availability;
  }

  // Check equipment
  if (resources.rackets > 0) {
    availability.equipment.rackets = await isEquipmentAvailable('racket', resources.rackets, startTime, endTime, excludeBookingId);
    if (!availability.equipment.rackets) {
      return availability;
    }
  } else {
    availability.equipment.rackets = true;
  }

  if (resources.shoes > 0) {
    availability.equipment.shoes = await isEquipmentAvailable('shoes', resources.shoes, startTime, endTime, excludeBookingId);
    if (!availability.equipment.shoes) {
      return availability;
    }
  } else {
    availability.equipment.shoes = true;
  }

  // Check coach
  if (resources.coach) {
    availability.coach = await isCoachAvailable(resources.coach, startTime, endTime, excludeBookingId);
    if (!availability.coach) {
      return availability;
    }
  } else {
    availability.coach = true;
  }

  availability.allAvailable = true;
  return availability;
}

module.exports = {
  isCourtAvailable,
  isCoachAvailable,
  isEquipmentAvailable,
  checkMultiResourceAvailability,
};

