const Doctor = require('../models/doctor.model');
const Patient = require('../models/patient.model');
const User = require('../models/user.model');
const Chat = require('../models/chat.model');

// Get all pending doctor approval requests
exports.getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ approvalStatus: 'pending' })
      .populate('user', 'name email profileImage phoneNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: pendingDoctors.length,
      data: {
        pendingDoctors
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Approve or reject doctor
exports.updateDoctorStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { approvalStatus, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid approval status'
      });
    }

    // If rejected, require a reason
    if (approvalStatus === 'rejected' && !rejectionReason) {
      return res.status(400).json({
        status: 'fail',
        message: 'Rejection reason is required'
      });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        approvalStatus,
        ...(approvalStatus === 'rejected' && { rejectionReason })
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!updatedDoctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        doctor: updatedDoctor
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const pendingDoctors = await Doctor.countDocuments({ approvalStatus: 'pending' });
    const approvedDoctors = await Doctor.countDocuments({ approvalStatus: 'approved' });
    const rejectedDoctors = await Doctor.countDocuments({ approvalStatus: 'rejected' });
    const totalUsers = await User.countDocuments();
    const totalChats = await Chat.countDocuments();

    // Get message volume (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // This would be a more complex aggregation in a real app
    const messageVolume = await Chat.aggregate([
      {
        $match: {
          createdAt: { $gte: lastWeek }
        }
      },
      {
        $project: {
          messageCount: { $size: "$messages" }
        }
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: "$messageCount" }
        }
      }
    ]);

    // Get daily registration stats for the last week
    const dailyStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: lastWeek }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          users: {
            total: totalUsers,
            doctors: totalDoctors,
            patients: totalPatients
          },
          doctorApproval: {
            pending: pendingDoctors,
            approved: approvedDoctors,
            rejected: rejectedDoctors,
            approvalRate: ((approvedDoctors / (approvedDoctors + rejectedDoctors)) * 100).toFixed(2)
          },
          messaging: {
            totalChats,
            messageVolume: messageVolume.length > 0 ? messageVolume[0].totalMessages : 0
          },
          dailyStats
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

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filterOptions = {};
    
    // Add role filter if provided
    if (req.query.role) {
      filterOptions.role = req.query.role;
    }
    
    const users = await User.find(filterOptions)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const totalDocs = await User.countDocuments(filterOptions);
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      totalPages: Math.ceil(totalDocs / limit),
      currentPage: page,
      data: {
        users
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get all doctors with their approval status
exports.getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter based on query params
    const filter = {};
    
    // Filter by approval status if provided
    if (req.query.status) {
      filter.approvalStatus = req.query.status;
    }
    
    // Filter by specialization if provided
    if (req.query.specialization) {
      filter.specialization = req.query.specialization;
    }
    
    // Search by name if provided
    if (req.query.name) {
      // First find users with matching names
      const users = await User.find({
        name: { $regex: req.query.name, $options: 'i' },
        role: 'doctor'
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      filter.user = { $in: userIds };
    }
    
    // Get total count for pagination
    const total = await Doctor.countDocuments(filter);
    
    // Get doctors with user details
    const doctors = await Doctor.find(filter)
      .populate({
        path: 'user',
        select: 'name email profileImage phoneNumber'
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: doctors.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: {
        doctors
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Toggle doctor active status
exports.toggleDoctorStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        status: 'fail',
        message: 'isActive must be a boolean value'
      });
    }
    
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found'
      });
    }
    
    // Get the user associated with this doctor
    const user = await User.findById(doctor.user);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Associated user not found'
      });
    }
    
    // Update the account status
    user.isActive = isActive;
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: `Doctor account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        doctorId,
        isActive
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
}; 