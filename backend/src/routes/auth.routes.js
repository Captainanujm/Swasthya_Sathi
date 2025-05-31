const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Custom middleware to handle validation errors with detailed messages
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      errors: errors.array()
    });
  }
  next();
};

// Register a new user
router.post(
  '/register',
  [
    // Name validation
    body('name')
      .not().isEmpty().withMessage('Name is required')
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Name should contain only letters and spaces')
      .trim(),
    
    // Email validation
    body('email')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail()
      .custom(async (value) => {
        const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          throw new Error('Email already in use');
        }
        return true;
      }),
    
    // Password validation
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),
    
    // Confirm password validation
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    
    // Role validation
    body('role')
      .optional()
      .isIn(['patient', 'doctor']).withMessage('Role must be either patient or doctor'),
    
    // Phone number validation - optional
    body('phoneNumber')
      .optional()
      .matches(/^(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/)
      .withMessage('Please provide a valid phone number'),
      
    // Terms agreement validation
    body('agreeToTerms')
      .optional()
      .isBoolean()
      .equals('true').withMessage('You must agree to terms and conditions')
  ],
  validate,
  authController.register
);

// Login user
router.post(
  '/login',
  [
    body('email')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .not().isEmpty().withMessage('Password is required')
  ],
  validate,
  authController.login
);

// Get current user's profile (protected route)
router.get(
  '/me',
  authMiddleware.protect,
  authController.getMe
);

// Update user profile (protected route)
router.patch(
  '/update-profile',
  authMiddleware.protect,
  [
    body('name')
      .optional()
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Name should contain only letters and spaces')
      .trim(),
    
    body('phoneNumber')
      .optional()
      .matches(/^(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/)
      .withMessage('Please provide a valid phone number'),
      
    body('profileImage')
      .optional()
  ],
  validate,
  authController.updateUserProfile
);

// Update password (protected route)
router.patch(
  '/update-password',
  authMiddleware.protect,
  [
    body('currentPassword')
      .not().isEmpty().withMessage('Current password is required'),
    
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character')
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error('New password must be different from current password');
        }
        return true;
      }),
      
    body('confirmNewPassword')
      .optional()
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ],
  validate,
  authController.updatePassword
);

// Create admin user (this is a development-only route that should be removed in production)
router.post('/create-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        status: 'fail',
        message: 'Admin user already exists',
        adminEmail: existingAdmin.email
      });
    }

    // Admin credentials
    const admin = {
      name: 'Admin User',
      email: 'admin@healthcare.com',
      password: 'Admin@123',
      role: 'admin'
    };

    // Hash the password manually to ensure consistency
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(admin.password, salt);

    // Create admin user with manually hashed password
    const newAdmin = await User.create({
      name: admin.name,
      email: admin.email,
      password: hashedPassword,
      role: admin.role,
      profileImage: 'default.jpg'
    });

    res.status(201).json({
      status: 'success',
      message: 'Admin user created successfully',
      data: {
        email: admin.email,
        password: admin.password // This is safe because the password is predefined, not user input
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// Reset admin user (delete existing and create new one)
router.post('/reset-admin', async (req, res) => {
  try {
    // Delete existing admin
    await User.deleteOne({ role: 'admin' });

    // Admin credentials
    const admin = {
      name: 'Admin User',
      email: 'admin@healthcare.com',
      password: 'Admin@123',
      role: 'admin'
    };

    // Hash the password manually to ensure consistency
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(admin.password, salt);

    // Create new admin user with manually hashed password
    const newAdmin = await User.create({
      name: admin.name,
      email: admin.email,
      password: hashedPassword,
      role: admin.role,
      profileImage: 'default.jpg'
    });

    res.status(201).json({
      status: 'success',
      message: 'Admin user reset successfully',
      data: {
        email: admin.email,
        password: admin.password
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

module.exports = router; 