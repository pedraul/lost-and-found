const foundItemService = require('../services/found-item.service');
const { AppError } = require('../middleware/error.middleware');

/**
 * @desc    Report a found item
 * @route   POST /api/found-items
 * @access  Private
 */
const reportFoundItem = async (req, res, next) => {
  try {
    const files = req.files || {};
    const overallImage = files.overall_image?.[0];
    const serialImage = files.serial_image?.[0];

    if (!overallImage || !serialImage) {
      throw new AppError('Overall item photo and identifier photo are required', 400);
    }

    const foundData = {
      ...req.body,
      // URLs set by the upload middleware (Vercel Blob in production, /uploads/ locally).
      overall_image_url: overallImage.url,
      overall_file_name: overallImage.originalname,
      serial_image_url: serialImage.url,
      serial_file_name: serialImage.originalname
    };
    const result = await foundItemService.reportFoundItem(req.user, foundData);
    res.status(201).json({
      success: true,
      message: 'Found item reported successfully. A verification code has been generated.',
      verification_code: result.verificationCode,
      data: { foundItem: result.foundItem }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all found items (public)
 * @route   GET /api/found-items
 * @access  Public
 */
const getFoundItems = async (req, res, next) => {
  try {
    const result = await foundItemService.getFoundItems(req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single found item by ID
 * @route   GET /api/found-items/:id
 * @access  Public
 */
const getFoundItemById = async (req, res, next) => {
  try {
    const item = await foundItemService.getFoundItemById(req.params.id);
    res.status(200).json({
      success: true,
      data: { foundItem: item }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Match found item to registered item
 * @route   POST /api/found-items/:id/match
 * @access  Private/Admin
 */
const matchFoundItem = async (req, res, next) => {
  try {
    const { registered_item_id, confidence_score } = req.body;
    const item = await foundItemService.markAsMatched(
      req.params.id,
      registered_item_id,
      req.user.id,
      confidence_score
    );
    res.status(200).json({
      success: true,
      message: 'Found item matched to registered item',
      data: { foundItem: item }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Claim a found item
 * @route   POST /api/found-items/:id/claim
 * @access  Private
 */
const claimFoundItem = async (req, res, next) => {
  try {
    const item = await foundItemService.claimFoundItem(req.params.id, {
      claimantId: req.user.id,
      claimNotes: req.body.claim_notes,
      claimProofDetails: req.body.claim_proof_details
    });
    res.status(200).json({
      success: true,
      message: 'Claim submitted successfully. Awaiting review.',
      data: { foundItem: item }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reportFoundItem,
  getFoundItems,
  getFoundItemById,
  matchFoundItem,
  claimFoundItem
};