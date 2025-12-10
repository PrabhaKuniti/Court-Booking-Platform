const mongoose = require('mongoose');

const PricingRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['peak_hour', 'weekend', 'indoor_premium', 'holiday', 'custom'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // For peak hours
  startTime: {
    type: String,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
  },
  endTime: {
    type: String,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
  },
  // For weekends
  daysOfWeek: [{
    type: Number,
    min: 0,
    max: 6,
  }],
  // Pricing modifier
  modifier: {
    type: {
      type: String,
      enum: ['multiplier', 'fixed_add', 'fixed_subtract', 'percentage'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  // For indoor premium
  appliesTo: {
    type: String,
    enum: ['all', 'indoor', 'outdoor'],
    default: 'all',
  },
  // For holidays
  specificDates: [{
    type: Date,
  }],
  description: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PricingRule', PricingRuleSchema);

