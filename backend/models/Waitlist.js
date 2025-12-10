const mongoose = require('mongoose');

const WaitlistSchema = new mongoose.Schema({
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
  preferredStartTime: {
    type: Date,
    required: true,
  },
  preferredEndTime: {
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
  notified: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

WaitlistSchema.index({ court: 1, preferredStartTime: 1, position: 1 });

module.exports = mongoose.model('Waitlist', WaitlistSchema);

