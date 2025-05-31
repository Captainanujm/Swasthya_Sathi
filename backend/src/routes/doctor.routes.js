const express = require('express');
const { body } = require('express-validator');
const doctorController = require('../controllers/doctor.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// Public routes
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorDetails);

// Protected routes that require authentication
router.use(authMiddleware.protect);

// Routes for patients
router.get('/followed/list', 
  roleMiddleware.restrictTo('patient'), 
  doctorController.getFollowedDoctors
);

router.post('/follow/:doctorId', 
  roleMiddleware.restrictTo('patient'),
  doctorController.followDoctor
);

router.delete('/unfollow/:doctorId',
  roleMiddleware.restrictTo('patient'),
  doctorController.unfollowDoctor
);

// Routes for doctors
router.post('/profile',
  roleMiddleware.restrictTo('doctor'),
  [
    body('specialization').not().isEmpty().withMessage('Specialization is required'),
    body('experience').isNumeric().withMessage('Experience must be a number'),
    body('qualification').not().isEmpty().withMessage('Qualification is required'),
    body('hospital').not().isEmpty().withMessage('Hospital/clinic name is required'),
    body('bio').not().isEmpty().withMessage('Bio is required'),
    body('licenseNumber').not().isEmpty().withMessage('License number is required')
  ],
  doctorController.createProfile
);

router.put('/profile',
  roleMiddleware.restrictTo('doctor'),
  doctorController.updateProfile
);

router.get('/profile/me',
  roleMiddleware.restrictTo('doctor'),
  doctorController.getProfile
);

router.get('/patients/list',
  roleMiddleware.restrictTo('doctor'),
  doctorController.getPatients
);

router.get('/patients/:patientId',
  roleMiddleware.restrictTo('doctor'),
  doctorController.getPatientDetails
);

module.exports = router; 