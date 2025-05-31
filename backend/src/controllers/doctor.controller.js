const Doctor = require('../models/doctor.model');
const User = require('../models/user.model');
const Follow = require('../models/follow.model');
const { validationResult } = require('express-validator');

// Create doctor profile
exports.createProfile = async (req, res) => {
  try {
    const {
      specialization,
      experience,
      qualification,
      hospital,
      bio,
      licenseNumber,
      consultationFee,
      availableHours,
      availableDays
    } = req.body;

    // Check if profile already exists
    const existingProfile = await Doctor.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(400).json({
        status: 'fail',
        message: 'Doctor profile already exists'
      });
    }

    // Create doctor profile
    const doctorProfile = await Doctor.create({
      user: req.user.id,
      specialization,
      experience,
      qualification,
      hospital,
      bio,
      licenseNumber,
      consultationFee,
      availableHours,
      availableDays
    });

    // Update user role to doctor if not already
    await User.findByIdAndUpdate(req.user.id, { role: 'doctor' });

    res.status(201).json({
      status: 'success',
      data: {
        doctorProfile
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get doctor profile
exports.getProfile = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user.id }).populate('user', 'name email profileImage phoneNumber');

    if (!doctorProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        doctorProfile
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Update doctor profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      specialization,
      experience,
      qualification,
      hospital,
      bio,
      consultationFee,
      availableHours,
      availableDays
    } = req.body;

    // Find doctor profile
    const doctorProfile = await Doctor.findOne({ user: req.user.id });

    if (!doctorProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor profile not found'
      });
    }

    // Update doctor profile
    const updatedProfile = await Doctor.findByIdAndUpdate(
      doctorProfile._id,
      {
        specialization,
        experience,
        qualification,
        hospital,
        bio,
        consultationFee,
        availableHours,
        availableDays
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        doctorProfile: updatedProfile
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get all approved doctors
exports.getAllDoctors = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { approvalStatus: 'approved' };
    
    // Filter by specialization if provided
    if (req.query.specialization) {
      filter.specialization = req.query.specialization;
    }
    
    // Filter by hospital if provided
    if (req.query.hospital) {
      filter.hospital = { $regex: req.query.hospital, $options: 'i' };
    }
    
    // Search by doctor name
    if (req.query.name) {
      // First find users with matching names
      const users = await User.find({
        name: { $regex: req.query.name, $options: 'i' },
        role: 'doctor'
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      filter.user = { $in: userIds };
    }
    
    // If authenticated patient, exclude followed doctors
    if (req.user && req.user.role === 'patient' && req.query.excludeFollowed === 'true') {
      // Get all doctors that the current user follows
      const followedDoctors = await Follow.find({ patient: req.user.id }).select('doctor');
      const followedUserIds = followedDoctors.map(follow => follow.doctor.toString());
      
      // If there are followed doctors, exclude them from the results
      if (followedUserIds.length > 0) {
        // If we already have a user filter, we need to combine it
        if (filter.user) {
          const currentUserIds = filter.user.$in;
          // Filter out followed user IDs from the current user IDs
          const filteredUserIds = currentUserIds.filter(
            id => !followedUserIds.includes(id.toString())
          );
          filter.user.$in = filteredUserIds;
        } else {
          // Otherwise, just exclude all followed user IDs
          filter.user = { $nin: followedUserIds };
        }
      }
    }
    
    // Get total count for pagination
    const total = await Doctor.countDocuments(filter);
    
    // Get doctors with user details
    const doctors = await Doctor.find(filter)
      .populate({
        path: 'user',
        select: 'name email profileImage'
      })
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1, followers: -1 });
    
    // Check if the current user (patient) follows each doctor
    let doctorsWithFollowStatus = doctors;
    
    if (req.user && req.user.role === 'patient') {
      // Get all doctors that the current user follows
      const followedDoctors = await Follow.find({ patient: req.user.id }).select('doctor');
      const followedDoctorIds = followedDoctors.map(follow => follow.doctor.toString());
      
      // Add isFollowing field to each doctor
      doctorsWithFollowStatus = doctors.map(doctor => {
        const doctorObj = doctor.toObject();
        doctorObj.isFollowing = followedDoctorIds.includes(doctor.user._id.toString());
        return doctorObj;
      });
    }
    
    res.status(200).json({
      status: 'success',
      results: doctors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        doctors: doctorsWithFollowStatus
      }
    });
  } catch (err) {
    console.error('Error in getAllDoctors:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get doctor details
exports.getDoctorDetails = async (req, res) => {
  try {
    const doctorId = req.params.id;
    let doctor;
    
    // First try to find doctor by its own ID
    doctor = await Doctor.findById(doctorId)
      .populate({
        path: 'user',
        select: 'name email profileImage phoneNumber'
      });
    
    // If not found by doctor ID, try finding by user ID
    if (!doctor) {
      doctor = await Doctor.findOne({ user: doctorId })
        .populate({
          path: 'user',
          select: 'name email profileImage phoneNumber'
        });
    }
    
    if (!doctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found'
      });
    }
    
    // Check if the doctor is approved
    if (doctor.approvalStatus !== 'approved') {
      return res.status(403).json({
        status: 'fail',
        message: 'This doctor is not approved yet'
      });
    }
    
    // Check if the current user follows this doctor
    let isFollowing = false;
    
    if (req.user && req.user.role === 'patient') {
      const followRecord = await Follow.findOne({
        patient: req.user.id,
        doctor: doctor.user._id
      });
      
      isFollowing = !!followRecord;
    }
    
    // Convert to a plain object to add the isFollowing field
    const doctorObj = doctor.toObject();
    doctorObj.isFollowing = isFollowing;
    
    res.status(200).json({
      status: 'success',
      data: {
        doctor: doctorObj
      }
    });
  } catch (err) {
    console.error('Error in getDoctorDetails:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Follow a doctor
exports.followDoctor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array()
      });
    }
    
    const doctorUserId = req.params.doctorId;
    
    // Check if the user exists and is a doctor
    const doctorUser = await User.findById(doctorUserId);
    
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found'
      });
    }
    
    // Check if the doctor is approved
    const doctor = await Doctor.findOne({ user: doctorUserId });
    
    if (!doctor || doctor.approvalStatus !== 'approved') {
      return res.status(403).json({
        status: 'fail',
        message: 'This doctor is not approved yet'
      });
    }
    
    // Check if already following
    const existingFollow = await Follow.findOne({
      patient: req.user.id,
      doctor: doctorUserId
    });
    
    if (existingFollow) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are already following this doctor'
      });
    }
    
    // Create follow record
    await Follow.create({
      patient: req.user.id,
      doctor: doctorUserId
    });
    
    // Increment doctor's followers count
    await Doctor.findByIdAndUpdate(doctor._id, {
      $inc: { followers: 1 }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'You are now following this doctor'
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are already following this doctor'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Unfollow a doctor
exports.unfollowDoctor = async (req, res) => {
  try {
    const doctorUserId = req.params.doctorId;
    
    // Check if the follow record exists
    const followRecord = await Follow.findOne({
      patient: req.user.id,
      doctor: doctorUserId
    });
    
    if (!followRecord) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are not following this doctor'
      });
    }
    
    // Delete the follow record
    await Follow.findByIdAndDelete(followRecord._id);
    
    // Find the doctor and decrement followers count
    const doctor = await Doctor.findOne({ user: doctorUserId });
    
    if (doctor) {
      await Doctor.findByIdAndUpdate(doctor._id, {
        $inc: { followers: -1 }
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'You have unfollowed this doctor'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get doctors followed by a patient
exports.getFollowedDoctors = async (req, res) => {
  try {
    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get all doctors that the current user follows
    const followedDoctorsCount = await Follow.countDocuments({ patient: req.user.id });
    
    const follows = await Follow.find({ patient: req.user.id })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'doctor',
        select: 'name email profileImage'
      });
    
    // Get doctor details for each followed doctor
    const doctorUserIds = follows.map(follow => follow.doctor._id);
    
    const doctors = await Doctor.find({
      user: { $in: doctorUserIds },
      approvalStatus: 'approved'
    }).populate({
      path: 'user',
      select: 'name email profileImage'
    });
    
    // Map doctor details to follows
    const followedDoctors = follows.map(follow => {
      const doctorInfo = doctors.find(d => d.user._id.toString() === follow.doctor._id.toString());
      return {
        followId: follow._id,
        followedAt: follow.createdAt,
        doctor: doctorInfo
      };
    }).filter(item => item.doctor); // Filter out any null doctors (in case they were unapproved)
    
    res.status(200).json({
      status: 'success',
      results: followedDoctors.length,
      total: followedDoctorsCount,
      totalPages: Math.ceil(followedDoctorsCount / limit),
      currentPage: page,
      data: {
        doctors: followedDoctors
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get doctor dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user.id });

    if (!doctorProfile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor profile not found'
      });
    }

    // Get stats - this would typically involve more collections and data in a real app
    const stats = {
      followers: doctorProfile.followers,
      rating: doctorProfile.rating,
      totalReviews: doctorProfile.totalReviews,
      totalPosts: doctorProfile.totalPosts,
      consultations: 0, // This would come from a consultations collection
      approvalStatus: doctorProfile.approvalStatus
    };

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get patients who follow the doctor
exports.getPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Increased limit to get more patients
    const skip = (page - 1) * limit;
    
    // Find all follows where this doctor is being followed
    const follows = await Follow.find({ doctor: doctorId })
      .populate({
        path: 'patient',  // This is the user ID of the patient
        model: 'User',    // Explicitly specify the User model
        select: 'name email profileImage'  // Select fields we want from User
      })
      .skip(skip)
      .limit(limit);
    
    console.log('Follows found:', follows.length);
    if (follows.length > 0) {
      console.log('First follow patient ID:', follows[0].patient);
    }
    
    // Get total count for pagination
    const total = await Follow.countDocuments({ doctor: doctorId });
    
    // Extract patient data with follow information
    const patients = follows.map(follow => {
      if (!follow.patient) {
        return {
          followId: follow._id,
          followedAt: follow.createdAt,
          id: 'unknown',
          name: 'Unknown Patient',
          email: '',
          profileImage: null
        };
      }
      
      // Get data from the populated user
      return {
        followId: follow._id,
        followedAt: follow.createdAt,
        id: follow.patient._id,
        name: follow.patient.name || 'Unnamed Patient',
        email: follow.patient.email || '',
        profileImage: follow.patient.profileImage || null
      };
    });
    
    res.status(200).json({
      status: 'success',
      results: patients.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        patients
      }
    });
  } catch (err) {
    console.error('Error in getPatients:', err);
    console.error('Error details:', err.stack);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get detailed information about a specific patient
exports.getPatientDetails = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const patientId = req.params.patientId;
    
    // First check if this patient follows the doctor
    const followInfo = await Follow.findOne({ 
      doctor: doctorId,
      patient: patientId
    });
    
    if (!followInfo) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient not found or does not follow you'
      });
    }
    
    // Get patient details
    const patient = await User.findById(patientId).select(
      'name email profileImage gender age phoneNumber medicalConditions allergies medications'
    );
    
    if (!patient) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        patient,
        followInfo: {
          followId: followInfo._id,
          followedAt: followInfo.createdAt
        }
      }
    });
  } catch (err) {
    console.error('Error in getPatientDetails:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
}; 