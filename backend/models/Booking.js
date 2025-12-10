const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  resources: {
    rackets: {
      type: Number,
      default: 0,
    },
    shoes: {
      type: Number,
      default: 0,
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach',
      default: null,
    },
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'waitlist'],
    default: 'confirmed',
  },
  pricingBreakdown: {
    basePrice: {
      type: Number,
      required: true,
    },
    courtPrice: {
      type: Number,
      required: true,
    },
    equipmentPrice: {
      type: Number,
      default: 0,
    },
    coachPrice: {
      type: Number,
      default: 0,
    },
    appliedRules: [{
      ruleName: String,
      modifier: String,
      value: Number,
      amount: Number,
    }],
    total: {
      type: Number,
      required: true,
    },
  },
}, {
  timestamps: true,
});

// Index for efficient availability queries
BookingSchema.index({ court: 1, startTime: 1, endTime: 1, status: 1 });
BookingSchema.index({ 'resources.coach': 1, startTime: 1, endTime: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);

