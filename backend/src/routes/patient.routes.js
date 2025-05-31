const express = require('express');
const { body } = require('express-validator');
const patientController = require('../controllers/patient.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public route for Swasthya Card QR code scanning
router.get('/scan/:patientId', patientController.getScanProfile);

// Add medical record or medication through QR code - for doctors
router.post(
  '/scan/:patientId/add-record',
  authMiddleware.protect,
  authMiddleware.restrictTo('doctor'),
  [
    body('recordType').isIn(['medication', 'medicalRecord']).withMessage('Invalid record type'),
    body('data').isObject().withMessage('Data must be an object')
  ],
  patientController.addRecordViaQR
);

// Get complete patient medical history for doctors
router.get(
  '/scan/:patientId/complete-history',
  authMiddleware.protect,
  authMiddleware.restrictTo('doctor'),
  patientController.getDoctorScanDetails
);

// New public route to get patient by Swasthya ID
router.get('/swasthya-id/:swasthyaId', patientController.getPatientBySwasthyaId);

// Protect all routes after this middleware
router.use(authMiddleware.protect);

// Routes specific to patients
router.use(authMiddleware.isPatient);

// Complete patient profile
router.patch(
  '/complete-profile',
  [
    body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
    body('height').optional().isNumeric().withMessage('Height must be a number'),
    body('weight').optional().isNumeric().withMessage('Weight must be a number'),
    body('estimatedBirthYear').optional().isNumeric().withMessage('Year must be a number')
  ],
  patientController.completeProfile
);

// Get patient profile
router.get('/profile', patientController.getProfile);

// Get patient Swasthya Card
router.get('/swasthya-card', patientController.getSwasthyaCard);

// Get medical summary
router.get('/medical-summary', patientController.getMedicalSummary);

// Update medical info
router.patch(
  '/medical-info',
  [
    body('allergies').optional().isArray().withMessage('Allergies must be an array'),
    body('chronicDiseases').optional().isArray().withMessage('Chronic diseases must be an array'),
    body('medications').optional().isArray().withMessage('Medications must be an array')
  ],
  patientController.updateMedicalInfo
);

// Update medications
router.patch(
  '/medications',
  [
    body('medications').isArray().withMessage('Medications must be an array')
  ],
  patientController.updateMedications
);

// Update medical records
router.patch(
  '/medical-records',
  [
    body('medicalRecords').isArray().withMessage('Medical records must be an array')
  ],
  patientController.updateMedicalRecords
);

// Medication Reminder Routes
// Get all medication reminders
router.get('/care/reminders', patientController.getMedicationReminders);

// Add a new medication reminder
router.post(
  '/care/reminders',
  [
    body('medicationName').notEmpty().withMessage('Medication name is required'),
    body('time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in 24-hour format (HH:MM)'),
    body('daysOfWeek').isArray().withMessage('Days of week must be an array')
  ],
  patientController.addMedicationReminder
);

// Update a medication reminder
router.patch(
  '/care/reminders/:reminderId',
  [
    body('medicationName').optional().notEmpty().withMessage('Medication name is required'),
    body('time').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in 24-hour format (HH:MM)'),
    body('daysOfWeek').optional().isArray().withMessage('Days of week must be an array'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  patientController.updateMedicationReminder
);

// Delete a medication reminder
router.delete('/care/reminders/:reminderId', patientController.deleteMedicationReminder);

module.exports = router; 