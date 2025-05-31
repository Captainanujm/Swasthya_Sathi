const Patient = require('../models/patient.model');
const User = require('../models/user.model');

// Complete patient profile
exports.completeProfile = async (req, res) => {
  try {
    const {
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      chronicDiseases,
      medications,
      height,
      weight,
      estimatedBirthYear
    } = req.body;

    // Find patient profile
    let patientProfile = await Patient.findOne({ user: req.user.id });

    if (!patientProfile) {
      // Create new patient profile if not exists
      patientProfile = await Patient.create({
        user: req.user.id
      });
    }

    // Update patient profile
    const updatedProfile = await Patient.findByIdAndUpdate(
      patientProfile._id,
      {
        dateOfBirth,
        gender,
        bloodGroup,
        address,
        emergencyContact,
        allergies,
        chronicDiseases,
        medications,
        height,
        weight,
        estimatedBirthYear
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        patientProfile: updatedProfile
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get patient profile
exports.getProfile = async (req, res) => {
  try {
    const patientProfile = await Patient.findOne({ user: req.user.id })
      .populate('user', 'name email profileImage phoneNumber');

    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        patientProfile
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get patient Swasthya Card
exports.getSwasthyaCard = async (req, res) => {
  try {
    const patientProfile = await Patient.findOne({ user: req.user.id })
      .populate('user', 'name email profileImage phoneNumber');

    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }

    // Generate Swasthya Card if not exists
    if (!patientProfile.swasthyaCardId) {
      // Generate a random 6-digit number
      const random = Math.floor(100000 + Math.random() * 900000);
      patientProfile.swasthyaCardId = random.toString();
      await patientProfile.save();
    }

    // Format data for the card
    const cardData = {
      cardNumber: patientProfile.swasthyaCardId,
      name: patientProfile.user.name,
      gender: patientProfile.gender,
      bloodGroup: patientProfile.bloodGroup,
      estimatedBirthYear: patientProfile.estimatedBirthYear || (patientProfile.dateOfBirth ? patientProfile.dateOfBirth.getFullYear() : null),
      issueDate: new Date(),
      profileImage: patientProfile.user.profileImage,
      emergencyContact: patientProfile.emergencyContact || null,
      allergies: patientProfile.allergies || []
    };

    res.status(200).json({
      status: 'success',
      data: {
        swasthyaCard: cardData
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get medical summary
exports.getMedicalSummary = async (req, res) => {
  try {
    const patientProfile = await Patient.findOne({ user: req.user.id })
      .populate('user', 'name email profileImage phoneNumber');

    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }

    // Format medical summary data
    const medicalSummary = {
      personalInfo: {
        name: patientProfile.user.name,
        gender: patientProfile.gender,
        bloodGroup: patientProfile.bloodGroup,
        age: patientProfile.dateOfBirth 
          ? Math.floor((new Date() - new Date(patientProfile.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) 
          : null,
        height: patientProfile.height,
        weight: patientProfile.weight,
        bmi: patientProfile.bmi
      },
      medicalInfo: {
        allergies: patientProfile.allergies || [],
        chronicDiseases: patientProfile.chronicDiseases || [],
        medications: patientProfile.medications || [],
        medicalRecords: patientProfile.medicalRecords || []
      },
      emergencyContact: patientProfile.emergencyContact || null
    };

    res.status(200).json({
      status: 'success',
      data: {
        medicalSummary
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Update medical info
exports.updateMedicalInfo = async (req, res) => {
  try {
    const { allergies, chronicDiseases, medications } = req.body;

    const patientProfile = await Patient.findOne({ user: req.user.id });

    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }

    const updatedProfile = await Patient.findByIdAndUpdate(
      patientProfile._id,
      {
        allergies,
        chronicDiseases,
        medications
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        patientProfile: updatedProfile
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get Patient Public Profile via QR Code
exports.getScanProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Find patient by user ID
    const patientProfile = await Patient.findOne({ user: patientId })
      .populate('user', 'name email profileImage');
    
    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }
    
    // Create a limited profile for public viewing via QR scan
    const publicProfile = {
      patientId,
      name: patientProfile.user.name,
      profileImage: patientProfile.user.profileImage,
      cardNumber: patientProfile.swasthyaCardId,
      gender: patientProfile.gender,
      bloodGroup: patientProfile.bloodGroup,
      age: patientProfile.dateOfBirth 
        ? Math.floor((new Date() - new Date(patientProfile.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) 
        : null,
      allergies: patientProfile.allergies || []
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        patientProfile: publicProfile
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Add Medical Record or Medication via QR code (for doctors)
exports.addRecordViaQR = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { recordType, data } = req.body;
    const doctorId = req.user.id;
    
    // Verify doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only doctors can add medical records'
      });
    }
    
    // Find patient by user ID
    const patientProfile = await Patient.findOne({ user: patientId });
    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }
    
    // Add data based on record type
    if (recordType === 'medication') {
      // Add medication
      const newMedication = {
        ...data,
        prescribedBy: {
          doctorId,
          name: doctor.name
        },
        dateAdded: new Date()
      };
      
      if (!patientProfile.medications) {
        patientProfile.medications = [];
      }
      
      patientProfile.medications.push(newMedication);
    } else if (recordType === 'medicalRecord') {
      // Add medical record
      const newRecord = {
        ...data,
        recordedBy: {
          doctorId,
          name: doctor.name
        },
        dateAdded: new Date()
      };
      
      if (!patientProfile.medicalRecords) {
        patientProfile.medicalRecords = [];
      }
      
      patientProfile.medicalRecords.push(newRecord);
    }
    
    await patientProfile.save();
    
    res.status(200).json({
      status: 'success',
      message: `${recordType === 'medication' ? 'Medication' : 'Medical record'} added successfully`,
      data: {
        recordType,
        data: recordType === 'medication' ? 
          patientProfile.medications[patientProfile.medications.length - 1] : 
          patientProfile.medicalRecords[patientProfile.medicalRecords.length - 1]
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get Complete Patient Medical History for Doctors via QR code
exports.getDoctorScanDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;
    
    // Verify doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only doctors can access complete medical history'
      });
    }
    
    // Find patient by user ID with complete data
    const patientProfile = await Patient.findOne({ user: patientId })
      .populate('user', 'name email profileImage phoneNumber');
    
    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }
    
    // Prepare complete medical history for doctors
    const completeHistory = {
      personalInfo: {
        patientId,
        name: patientProfile.user.name,
        email: patientProfile.user.email,
        profileImage: patientProfile.user.profileImage,
        phoneNumber: patientProfile.user.phoneNumber,
        cardNumber: patientProfile.swasthyaCardId,
        gender: patientProfile.gender,
        bloodGroup: patientProfile.bloodGroup,
        dateOfBirth: patientProfile.dateOfBirth,
        age: patientProfile.dateOfBirth 
          ? Math.floor((new Date() - new Date(patientProfile.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) 
          : null,
        height: patientProfile.height,
        weight: patientProfile.weight,
        bmi: patientProfile.height && patientProfile.weight 
          ? (patientProfile.weight / ((patientProfile.height/100) * (patientProfile.height/100))).toFixed(1) 
          : null
      },
      medicalInfo: {
        allergies: patientProfile.allergies || [],
        chronicDiseases: patientProfile.chronicDiseases || [],
        medications: patientProfile.medications || [],
        medicalRecords: patientProfile.medicalRecords || []
      },
      emergencyContact: patientProfile.emergencyContact || null,
      // Add access timestamp for auditing
      accessedAt: new Date()
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        patientHistory: completeHistory
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Update medications
exports.updateMedications = async (req, res) => {
  try {
    const { medications } = req.body;

    const patientProfile = await Patient.findOne({ user: req.user.id });

    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }

    // Update medications
    patientProfile.medications = medications;
    await patientProfile.save();

    res.status(200).json({
      status: 'success',
      message: 'Medications updated successfully',
      data: {
        medications: patientProfile.medications
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Update medical records
exports.updateMedicalRecords = async (req, res) => {
  try {
    const { medicalRecords } = req.body;

    const patientProfile = await Patient.findOne({ user: req.user.id });

    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }

    // Update medical records
    patientProfile.medicalRecords = medicalRecords;
    await patientProfile.save();

    res.status(200).json({
      status: 'success',
      message: 'Medical records updated successfully',
      data: {
        medicalRecords: patientProfile.medicalRecords
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get medication reminders
exports.getMedicationReminders = async (req, res) => {
  try {
    const patientProfile = await Patient.findOne({ user: req.user.id });

    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        reminders: patientProfile.medicationReminders || []
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Add medication reminder
exports.addMedicationReminder = async (req, res) => {
  try {
    const {
      medicationId,
      medicationName,
      dosage,
      time,
      daysOfWeek,
      notes
    } = req.body;

    const patientProfile = await Patient.findOne({ user: req.user.id });

    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }

    // Initialize medication reminders array if it doesn't exist
    if (!patientProfile.medicationReminders) {
      patientProfile.medicationReminders = [];
    }

    // Create new reminder
    const newReminder = {
      medicationId,
      medicationName,
      dosage,
      time,
      daysOfWeek,
      notes,
      isActive: true,
      createdAt: new Date(),
      lastModified: new Date()
    };

    // Add to reminders array
    patientProfile.medicationReminders.push(newReminder);
    await patientProfile.save();

    res.status(201).json({
      status: 'success',
      message: 'Medication reminder added successfully',
      data: {
        reminder: patientProfile.medicationReminders[patientProfile.medicationReminders.length - 1]
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Update medication reminder
exports.updateMedicationReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    
    const patientProfile = await Patient.findOne({ user: req.user.id });

    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }

    // Find the reminder by ID
    const reminderIndex = patientProfile.medicationReminders.findIndex(
      reminder => reminder._id.toString() === reminderId
    );

    if (reminderIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Medication reminder not found'
      });
    }

    // Update the reminder fields
    const updatedReminder = {
      ...patientProfile.medicationReminders[reminderIndex].toObject(),
      ...req.body,
      lastModified: new Date()
    };

    // Replace the old reminder with the updated one
    patientProfile.medicationReminders[reminderIndex] = updatedReminder;
    await patientProfile.save();

    res.status(200).json({
      status: 'success',
      message: 'Medication reminder updated successfully',
      data: {
        reminder: patientProfile.medicationReminders[reminderIndex]
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Delete medication reminder
exports.deleteMedicationReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    
    const patientProfile = await Patient.findOne({ user: req.user.id });

    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient profile not found'
      });
    }

    // Remove the reminder with the matching ID
    patientProfile.medicationReminders = patientProfile.medicationReminders.filter(
      reminder => reminder._id.toString() !== reminderId
    );

    await patientProfile.save();

    res.status(200).json({
      status: 'success',
      message: 'Medication reminder deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get patient by Swasthya ID - full medical details
exports.getPatientBySwasthyaId = async (req, res) => {
  try {
    const { swasthyaId } = req.params;
    
    if (!swasthyaId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Swasthya ID is required'
      });
    }
    
    // Find patient by Swasthya ID
    const patientProfile = await Patient.findOne({ swasthyaCardId: swasthyaId })
      .populate('user', 'name email profileImage phoneNumber');
    
    if (!patientProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient with this Swasthya ID not found'
      });
    }
    
    // Prepare complete medical details
    const completeDetails = {
      personalInfo: {
        patientId: patientProfile.user._id,
        name: patientProfile.user.name,
        email: patientProfile.user.email,
        profileImage: patientProfile.user.profileImage,
        phoneNumber: patientProfile.user.phoneNumber,
        cardNumber: patientProfile.swasthyaCardId,
        gender: patientProfile.gender,
        bloodGroup: patientProfile.bloodGroup,
        dateOfBirth: patientProfile.dateOfBirth,
        age: patientProfile.dateOfBirth 
          ? Math.floor((new Date() - new Date(patientProfile.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) 
          : null,
        height: patientProfile.height,
        weight: patientProfile.weight,
        bmi: patientProfile.bmi
      },
      medicalInfo: {
        allergies: patientProfile.allergies || [],
        chronicDiseases: patientProfile.chronicDiseases || [],
        medications: patientProfile.medications || [],
        medicalRecords: patientProfile.medicalRecords || []
      },
      emergencyContact: patientProfile.emergencyContact || null
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        patientDetails: completeDetails
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
}; 