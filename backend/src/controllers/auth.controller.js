const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');
const Patient = require('../models/patient.model');
const { validationResult } = require('express-validator');

// Generate JWT token
const signToken = (id, role, name) => {
  // Fallback JWT_SECRET if environment variable is not set
  const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_key_for_jwt_tokens_healthcare_platform_2024';
  
  console.log('Using JWT secret with length:', jwtSecret.length);
  
  return jwt.sign(
    { id, role, name },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// Send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role, user.name);
  
  // Update last login time
  User.findByIdAndUpdate(user._id, { lastLogin: Date.now() }).exec();

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    }
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    // The validation is now handled by middleware

    const { name, email, password, role, phoneNumber, agreeToTerms } = req.body;

    // Create user with sanitized data
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: role || 'patient',
      phoneNumber: phoneNumber || '',
      // Store any additional preferences
      preferences: {
        agreedToTerms: !!agreeToTerms,
        agreedDate: new Date()
      }
    });

    // If role is patient, create patient profile
    if (newUser.role === 'patient') {
      await Patient.create({
        user: newUser._id
      });
    }

    createSendToken(newUser, 201, res);
  } catch (err) {
    // Handle mongoose duplicate key error explicitly
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use. Please try a different email address.'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    // Special case for admin login with hardcoded credentials
    if (email === 'admin@healthcare.com' && password === 'Admin@123') {
      const adminUser = await User.findOne({ email: 'admin@healthcare.com' });
      
      if (adminUser && adminUser.role === 'admin') {
        // Send token for admin without password check
        return createSendToken(adminUser, 200, res);
      }
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // For doctors, check if they are approved
    if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: user._id });
      if (doctorProfile && doctorProfile.approvalStatus !== 'approved') {
        return res.status(403).json({
          status: 'fail',
          message: `Your doctor profile is ${doctorProfile.approvalStatus}. Please wait for admin approval.`,
          approvalStatus: doctorProfile.approvalStatus
        });
      }
    }

    // Send token
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    // User is already available in req due to the protect middleware
    const user = await User.findById(req.user.id);
    
    let profileData = null;
    
    // Get role-specific profile data
    if (user.role === 'doctor') {
      profileData = await Doctor.findOne({ user: user._id });
    } else if (user.role === 'patient') {
      profileData = await Patient.findOne({ user: user._id });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt,
          profile: profileData
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phoneNumber, profileImage } = req.body;
    
    // Fields to update
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (profileImage) updateFields.profileImage = profileImage;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          profileImage: updatedUser.profileImage,
          phoneNumber: updatedUser.phoneNumber
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
}; 