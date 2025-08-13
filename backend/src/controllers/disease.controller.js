const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const Disease = require('../models/disease.model');
const Doctor = require('../models/doctor.model');
const User = require('../models/user.model');

// Upload image and get disease prediction
exports.uploadImage = async (req, res) => {
  try {
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No image uploaded'
      });
    }

    // Create formdata for Flask API
    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path));

    // Send image to Flask service for prediction
    const flaskResponse = await axios.post(
      'https://swasthya-sathi-6.onrender.com/predict',
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );

    // Remove temporary file
    fs.unlinkSync(req.file.path);

    // Extract disease prediction data
    const { disease, confidence, remedies, precautions } = flaskResponse.data;

    // Get or create disease in database
    let diseaseRecord = await Disease.findOne({ name: disease });
    
    if (!diseaseRecord) {
      // If disease doesn't exist in DB, create it using the mapping
      const specialties = Disease.diseaseToSpecialtyMap[disease] || ['Dermatology'];
      
      diseaseRecord = await Disease.create({
        name: disease,
        specialties,
        remedies,
        precautions
      });
    }

    // Find doctors who specialize in treating this disease
    const doctorProfiles = await Doctor.find({
      $or: [
        { specialties: { $in: diseaseRecord.specialties } },
        { subSpecialties: { $in: diseaseRecord.specialties } }
      ],
      approvalStatus: 'approved'
    }).populate({
      path: 'user',
      select: 'name email profileImage'
    }).limit(5);

    // Format doctor data
    const recommendedDoctors = doctorProfiles.map(doctor => ({
      id: doctor.user._id,
      name: doctor.user.name,
      profileImage: doctor.user.profileImage,
      hospital: doctor.currentHospital,
      specialties: doctor.specialties,
      experience: doctor.experience
    }));

    // Return the results
    res.status(200).json({
      status: 'success',
      data: {
        disease,
        confidence,
        remedies,
        precautions,
        recommendedDoctors
      }
    });
  } catch (error) {
    console.error('Disease detection error:', error);
    
    // Remove uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error removing temporary file:', unlinkError);
      }
    }
    
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error processing image'
    });
  }
};

// Get disease by name
exports.getDiseaseByName = async (req, res) => {
  try {
    const disease = await Disease.findOne({ name: req.params.name });
    
    if (!disease) {
      return res.status(404).json({
        status: 'fail',
        message: 'Disease not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        disease
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all diseases
exports.getAllDiseases = async (req, res) => {
  try {
    const diseases = await Disease.find();
    
    res.status(200).json({
      status: 'success',
      results: diseases.length,
      data: {
        diseases
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Check Flask service status
exports.checkStatus = async (req, res) => {
  try {
    // Try to contact Flask service
    const response = await axios.get(
      ( 'https://swasthya-sathi-6.onrender.com/predict').replace('/predict', '/ping'),
      { timeout: 5000 }
    );
    
    // If we get here, the service is running
    res.status(200).json({
      status: 'success',
      data: {
        status: 'running',
        message: 'Flask service is running'
      }
    });
  } catch (error) {
    console.error('Flask service check failed:', error);
    
    res.status(200).json({
      status: 'success',
      data: {
        status: 'not_running',
        message: 'Flask service is not running'
      }
    });
  }
}; 