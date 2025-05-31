const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure a patient can follow a doctor only once
followSchema.index({ patient: 1, doctor: 1 }, { unique: true });

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow; 