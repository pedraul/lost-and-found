const itemService = require('../services/item.service');

/**
 * @desc    Register a new item
 * @route   POST /api/items
 * @access  Private
 */
const registerItem = async (req, res, next) => {
  try {
    const receiptFile = req.files?.receipt_image?.[0];
    const deviceFile = req.files?.device_image?.[0];
    // Set by the upload middleware (Vercel Blob URL in production, /uploads/ locally).
    const publicUrl = (file) => file && file.url;
    const receiptUrl = publicUrl(receiptFile);
    const deviceUrl = publicUrl(deviceFile);
    const itemData = {
      ...req.body,
      receipt_image_url: receiptUrl,
      receipt_file_name: receiptFile?.originalname,
      front_image_url: deviceUrl,
      front_file_name: deviceFile?.originalname,
      back_image_url: deviceUrl,
      back_file_name: deviceFile?.originalname,
      serial_image_url: deviceUrl,
      serial_file_name: deviceFile?.originalname
    };
    const result = await itemService.registerItem(req.user, itemData);
    res.status(201).json({
      success: true,
      message: 'Item registered successfully',
      verification_code: result.verificationCode,
      data: { item: result.item }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public lost and stolen items
 * @route   GET /api/lost-items
 * @access  Public
 */
const getPublicLostItems = async (req, res, next) => {
  try {
    const result = await itemService.getPublicLostItems(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all items for current user
 * @route   GET /api/items
 * @access  Private
 */
const getMyItems = async (req, res, next) => {
  try {
    const result = await itemService.getMyItems(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item by ID
 * @route   GET /api/items/:id
 * @access  Private
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await itemService.getItemById(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: { item }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item
 * @route   PATCH /api/items/:id
 * @access  Private
 */
const updateItem = async (req, res, next) => {
  try {
    const item = await itemService.updateItem(req.params.id, req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: { item }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete item (soft delete)
 * @route   DELETE /api/items/:id
 * @access  Private
 */
const deleteItem = async (req, res, next) => {
  try {
    const result = await itemService.deleteItem(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search item by identifier
 * @route   GET /api/items/search?identifier=...&identifier_type=...
 * @access  Public
 */
const searchByIdentifier = async (req, res, next) => {
  try {
    const { identifier, identifier_type } = req.query;
    const item = await itemService.findByIdentifier(identifier, identifier_type);
    res.status(200).json({
      success: true,
      data: { item }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get device types (for registration form)
 * @route   GET /api/items/device-types
 * @access  Public
 */
const getDeviceTypes = async (req, res, next) => {
  try {
    const deviceTypes = await require('../models/DeviceType').findAll({
      where: { is_active: true },
      include: [{
        model: require('../models/Category'),
        as: 'category',
        attributes: ['id', 'name', 'display_name', 'icon']
      }],
      order: [['display_order', 'ASC']]
    });
    res.status(200).json({
      success: true,
      data: { deviceTypes }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get manufacturers by device type
 * @route   GET /api/items/device-types/:id/manufacturers
 * @access  Public
 */
const getManufacturersByDeviceType = async (req, res, next) => {
  try {
    const deviceTypeId = req.params.id;
    const manufacturers = await require('../models/Manufacturer').findAll({
      include: [{
        model: require('../models/DeviceType'),
        as: 'deviceTypes',
        where: { id: deviceTypeId },
        attributes: []
      }],
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    res.status(200).json({
      success: true,
      data: { manufacturers }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerItem,
  getMyItems,
  getPublicLostItems,
  getItemById,
  updateItem,
  deleteItem,
  searchByIdentifier,
  getDeviceTypes,
  getManufacturersByDeviceType
};
