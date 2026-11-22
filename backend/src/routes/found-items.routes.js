const express = require('express');
const router = express.Router();
const foundItemController = require('../controllers/found-item.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { registerFoundItemSchema } = require('../validators/found-item.validator');

// @route   GET /api/found-items
// @desc    Get all found items (public)
// @access  Public
router.get('/', foundItemController.getFoundItems);

// @route   GET /api/found-items/:id
// @desc    Get single found item by ID (public)
// @access  Public
router.get('/:id', foundItemController.getFoundItemById);

// All routes below require authentication
router.use(protect);

// @route   POST /api/found-items
// @desc    Report a found item
// @access  Private
router.post('/', validate(registerFoundItemSchema), foundItemController.reportFoundItem);

// @route   POST /api/found-items/:id/match
// @desc    Match found item to registered item
// @access  Private/Admin
router.post('/:id/match', restrictTo('admin', 'user'), foundItemController.matchFoundItem);

// @route   POST /api/found-items/:id/claim
// @desc    Claim a found item
// @access  Private
router.post('/:id/claim', foundItemController.claimFoundItem);

module.exports = router;