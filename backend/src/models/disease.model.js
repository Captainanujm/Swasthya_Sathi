const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Disease name is required'],
    trim: true
  },
  specialties: {
    type: [String],
    required: [true, 'At least one specialty must be associated with the disease'],
    default: ['General']
  },
  description: {
    type: String,
    trim: true
  },
  remedies: {
    type: [String],
    default: []
  },
  precautions: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure specialties are capitalized
diseaseSchema.pre('save', function(next) {
  if (this.specialties && this.specialties.length > 0) {
    this.specialties = this.specialties.map(specialty => 
      specialty.charAt(0).toUpperCase() + specialty.slice(1).toLowerCase()
    );
  }
  next();
});

// Create a mapping of diseases to their associated specialties
diseaseSchema.statics.diseaseToSpecialtyMap = {
  'Acne': ['Dermatology'],
  'Eczema': ['Dermatology', 'Allergy and Immunology'],
  'Ringworm': ['Dermatology', 'Infectious Disease'],
  'Psoriasis': ['Dermatology', 'Rheumatology'],
  'Vitiligo': ['Dermatology'],
  'Melanoma': ['Dermatology', 'Oncology'],
  'Actinic Keratosis': ['Dermatology'],
  'Basal Cell Carcinoma': ['Dermatology', 'Oncology']
};

const Disease = mongoose.model('Disease', diseaseSchema);

module.exports = Disease; 