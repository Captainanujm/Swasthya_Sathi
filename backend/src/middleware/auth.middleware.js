const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { promisify } = require('util');

// Middleware to protect routes - only authenticated users can access
exports.protect = async (req, res, next) => {
  try {
    // 1) Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4) Set user in request
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token or authentication failed.'
    });
  }
};

// Middleware to restrict access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Middleware to check if user is a doctor
exports.isDoctor = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        status: 'fail',
        message: 'This route is only accessible to doctors'
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to check if user is a patient
exports.isPatient = async (req, res, next) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        status: 'fail',
        message: 'This route is only accessible to patients'
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to check if user is an admin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'This route is only accessible to admins'
      });
    }
    next();
  } catch (err) {
    next(err);
  }
}; 