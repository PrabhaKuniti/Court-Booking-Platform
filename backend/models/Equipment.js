const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['racket', 'shoes'],
    required: true,
  },
  totalStock: {
    type: Number,
    required: true,
    default: 0,
  },
  rentalPrice: {
    type: Number,
    required: true,
    default: 5,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Equipment', EquipmentSchema);

