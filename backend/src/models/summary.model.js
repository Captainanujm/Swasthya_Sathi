const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  testResults: {
    type: [{
      name: String,
      value: Number,
      unit: String,
      referenceRange: {
        min: Number,
        max: Number
      },
      status: {
        type: String,
        enum: ['normal', 'high', 'low', 'unknown'],
        default: 'unknown'
      }
    }],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Summary = mongoose.model('Summary', summarySchema);

module.exports = Summary; 