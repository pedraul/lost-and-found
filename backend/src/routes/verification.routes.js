const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createVerificationSchema, verifyCodeSchema } = require('../validators/verification.validator');

// @route   POST /api/verifications/:itemId
// @desc    Create a verification request for an item
// @access  Private
router.post('/:itemId', protect, validate(createVerificationSchema), verificationController.createVerification);

// @route   POST /api/verifications/verify-code
// @desc    Verify using a code (scan / manual entry)
// @access  Public
router.post('/verify-code', validate(verifyCodeSchema), verificationController.verifyWithCode);

// @route   GET /api/verifications/:id
// @desc    Get verification status for an item
// @access  Public
router.get('/:id', verificationController.getVerificationStatus);

module.exports = router;