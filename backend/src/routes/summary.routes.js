const express = require('express');
const summaryController = require('../controllers/summary.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// All routes are protected and require patient role
router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('patient'));

// Routes for PDF upload and summary
router.post('/upload', summaryController.uploadAndSummarize);

// Routes for retrieving summaries
router.get('/', summaryController.getSummaries);
router.get('/:id', summaryController.getSummary);

// Route for deleting a summary
router.delete('/:id', summaryController.deleteSummary);

module.exports = router; 