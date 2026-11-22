const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

// All report routes are protected
router.use(protect);

// @route   GET /api/reports/:itemId
// @desc    Get a report for a registered item
// @access  Private
router.get('/:itemId', reportController.generateItemReport);

module.exports = router;