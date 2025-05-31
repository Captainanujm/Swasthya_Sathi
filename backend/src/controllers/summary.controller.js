const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const Summary = require('../models/summary.model');
const { processPDF } = require('../utils/pdf-service');

// Upload a PDF and generate a summary
exports.uploadAndSummarize = async (req, res) => {
  try {
    console.log('Received upload request');
    
    // Check if file exists in the request
    if (!req.files || !req.files.pdfFile) {
      console.log('No file in request', req.files);
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload a PDF file'
      });
    }
    
    const pdfFile = req.files.pdfFile;
    console.log('File received:', pdfFile.name, 'Size:', pdfFile.size, 'Type:', pdfFile.mimetype);
    
    // Validate file type
    if (pdfFile.mimetype !== 'application/pdf') {
      console.log('Invalid file type:', pdfFile.mimetype);
      return res.status(400).json({
        status: 'fail',
        message: 'Only PDF files are allowed'
      });
    }
    
    // Validate file size (max 10MB)
    if (pdfFile.size > 10 * 1024 * 1024) {
      console.log('File too large:', pdfFile.size);
      return res.status(400).json({
        status: 'fail',
        message: 'File is too large. Maximum size is 10MB'
      });
    }
    
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${pdfFile.name}`;
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    const filePath = path.join(uploadDir, uniqueFilename);
    
    console.log('Saving file to:', filePath);
    
    // Ensure directory exists
    await fs.ensureDir(uploadDir);
    
    // Move the file to the temporary directory
    await pdfFile.mv(filePath);
    console.log('File saved successfully');
    
    // Process the PDF and get a summary and test results
    console.log('Processing PDF to generate summary and extract test results');
    const { summary, testResults } = await processPDF(filePath);
    console.log('Summary generated successfully');
    console.log('Test results extracted:', testResults.length);
    
    const userId = req.user.id;
    const originalFilename = pdfFile.name;
    
    // Save the summary and test results to the database
    console.log('Saving summary to database');
    const newSummary = await Summary.create({
      user: userId,
      originalFilename,
      summary,
      testResults
    });
    console.log('Summary saved with ID:', newSummary._id);
    
    res.status(201).json({
      status: 'success',
      data: {
        summary: newSummary
      }
    });
  } catch (err) {
    console.error('Error in uploadAndSummarize:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to process PDF file'
    });
  }
};

// Get all summaries for the current user
exports.getSummaries = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const summaries = await Summary.find({ user: userId })
      .sort({ createdAt: -1 }); // Most recent first
    
    res.status(200).json({
      status: 'success',
      results: summaries.length,
      data: {
        summaries
      }
    });
  } catch (err) {
    console.error('Error in getSummaries:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch summaries'
    });
  }
};

// Get a specific summary by ID
exports.getSummary = async (req, res) => {
  try {
    const summaryId = req.params.id;
    const userId = req.user.id;
    
    const summary = await Summary.findOne({
      _id: summaryId,
      user: userId
    });
    
    if (!summary) {
      return res.status(404).json({
        status: 'fail',
        message: 'Summary not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        summary
      }
    });
  } catch (err) {
    console.error('Error in getSummary:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch summary'
    });
  }
};

// Delete a summary
exports.deleteSummary = async (req, res) => {
  try {
    const summaryId = req.params.id;
    const userId = req.user.id;
    
    const summary = await Summary.findOneAndDelete({
      _id: summaryId,
      user: userId
    });
    
    if (!summary) {
      return res.status(404).json({
        status: 'fail',
        message: 'Summary not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Summary deleted successfully'
    });
  } catch (err) {
    console.error('Error in deleteSummary:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete summary'
    });
  }
}; 