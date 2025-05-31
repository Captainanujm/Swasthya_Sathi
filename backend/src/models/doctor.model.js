const mongoose = require('mongoose');
const User = require('./user.model');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Please provide your specialization'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Please provide your years of experience']
  },
  qualification: {
    type: String,
    required: [true, 'Please provide your qualification']
  },
  hospital: {
    type: String,
    required: [true, 'Please provide your hospital/clinic name']
  },
  bio: {
    type: String,
    required: [true, 'Please provide a short bio'],
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please provide your license number'],
    unique: true
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  consultationFee: {
    type: Number
  },
  availableHours: {
    from: {
      type: String
    },
    to: {
      type: String
    }
  },
  availableDays: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  followers: {
    type: Number,
    default: 0
  },
  totalPosts: {
    type: Number,
    default: 0
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for full profile
doctorSchema.virtual('fullProfile', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

// Index for faster queries
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ approvalStatus: 1 });
doctorSchema.index({ hospital: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor; 