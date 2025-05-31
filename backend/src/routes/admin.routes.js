const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware.protect);

// Restrict access to admin only
router.use(authMiddleware.isAdmin);

// Get pending doctor approval requests
router.get('/doctor-requests', adminController.getPendingDoctors);

// Approve or reject doctor
router.patch(
  '/doctor-status/:doctorId',
  [
    body('approvalStatus')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be either approved or rejected'),
    body('rejectionReason')
      .if(body('approvalStatus').equals('rejected'))
      .not()
      .isEmpty()
      .withMessage('Rejection reason is required if status is rejected')
  ],
  adminController.updateDoctorStatus
);

// Get admin dashboard stats
router.get('/stats', adminController.getDashboardStats);

// Get all users with filtering options
router.get('/users', adminController.getAllUsers);

// Get all doctors with status information
router.get('/doctors', adminController.getAllDoctors);

// Toggle doctor's active status
router.patch(
  '/doctor-active-status/:doctorId',
  [
    body('isActive').isBoolean().withMessage('isActive must be a boolean value')
  ],
  adminController.toggleDoctorStatus
);

module.exports = router; 