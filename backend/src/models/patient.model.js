const mongoose = require('mongoose');
const User = require('./user.model');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  allergies: [String],
  chronicDiseases: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    instructions: String,
    prescribedBy: {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String
    },
    dateAdded: {
      type: Date,
      default: Date.now
    }
  }],
  medicationReminders: [{
    medicationId: String, // Can be linked to an existing medication or new one
    medicationName: String,
    dosage: String,
    time: String, // Time in 24-hour format "HH:MM"
    daysOfWeek: [{ // Days when reminder is active
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastModified: {
      type: Date,
      default: Date.now
    }
  }],
  medicalRecords: [{
    title: String,
    description: String,
    date: Date,
    recordedBy: {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String
    },
    dateAdded: {
      type: Date,
      default: Date.now
    }
  }],
  swasthyaCardId: {
    type: String,
    unique: true,
    sparse: true
  },
  estimatedBirthYear: {
    type: Number
  },
  height: {
    type: Number // in cm
  },
  weight: {
    type: Number // in kg
  },
  bmi: {
    type: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for full profile
patientSchema.virtual('fullProfile', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

// Calculate BMI before saving
patientSchema.pre('save', function(next) {
  if (this.height && this.weight) {
    // Calculate BMI: weight (kg) / (height (m))^2
    const heightInMeters = this.height / 100;
    this.bmi = (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }
  next();
});

// Generate SwasthyaCardId if not present
patientSchema.pre('save', function(next) {
  if (!this.swasthyaCardId) {
    // Generate a random 6-digit number
    const random = Math.floor(100000 + Math.random() * 900000);
    this.swasthyaCardId = random.toString();
  }
  next();
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient; 