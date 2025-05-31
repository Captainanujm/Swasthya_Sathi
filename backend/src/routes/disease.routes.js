const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const diseaseController = require('../controllers/disease.controller');
const { protect } = require('../middleware/auth.middleware');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'disease-' + uniqueSuffix + ext);
  }
});

// Define file filter for image uploads
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter
});

// Routes
router.post('/upload', 
  protect, 
  upload.single('image'),
  diseaseController.uploadImage
);

router.get('/status/check', diseaseController.checkStatus);
router.get('/all', protect, diseaseController.getAllDiseases);
router.get('/:name', protect, diseaseController.getDiseaseByName);

module.exports = router; 