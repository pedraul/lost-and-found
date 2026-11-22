const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { registerItemSchema } = require('../validators/item.validator');

// All item routes require authentication
router.use(protect);

// @route   POST /api/items
// @desc    Register a new item
// @access  Private
router.post('/', validate(registerItemSchema), itemController.registerItem);

// @route   GET /api/items
// @desc    Get all items for current user
// @access  Private
router.get('/', itemController.getMyItems);

// @route   GET /api/items/:id
// @desc    Get single item by ID
// @access  Private
router.get('/:id', itemController.getItemById);

// @route   PATCH /api/items/:id
// @desc    Update an item
// @access  Private
router.patch('/:id', itemController.updateItem);

// @route   DELETE /api/items/:id
// @desc    Delete an item (soft delete)
// @access  Private
router.delete('/:id', itemController.deleteItem);

// @route   GET /api/items/search/:identifierType/:identifier
// @desc    Search an item by identifier type and value
// @access  Public
router.get('/search/:identifierType/:identifier', itemController.searchByIdentifier);

// @route   GET /api/items/device-types
// @desc    Get device types for registration form
// @access  Public
router.get('/device-types', itemController.getDeviceTypes);

// @route   GET /api/items/device-types/:deviceTypeId/manufacturers
// @desc    Get manufacturers for a device type
// @access  Public
router.get('/device-types/:deviceTypeId/manufacturers', itemController.getManufacturersByDeviceType);

module.exports = router;