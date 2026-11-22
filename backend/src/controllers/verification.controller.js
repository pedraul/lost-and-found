const verificationService = require('../services/verification.service');

/**
 * @desc    Verify an item (ownership verification)
 * @route   POST /api/verifications
 * @access  Private
 */
const createVerification = async (req, res, next) => {
  try {
    const result = await verificationService.createVerification(
      req.user.id,
      req.params.itemId,
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify using a code (scan QR / enter code)
 * @route   POST /api/verifications/verify-code
 * @access  Public
 */
const verifyWithCode = async (req, res, next) => {
  try {
    const result = await verificationService.verifyWithCode(
      req.body.verification_code,
      req.body.item_id
    );
    res.status(200).json({
      success: true,
      message: 'Item verified successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get verification status for an item
 * @route   GET /api/verifications/:id
 * @access  Public
 */
const getVerificationStatus = async (req, res, next) => {
  try {
    const status = await verificationService.getVerificationStatus(
      req.params.id
    );
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVerification,
  verifyWithCode,
  getVerificationStatus
};