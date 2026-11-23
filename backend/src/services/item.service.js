const { Op } = require('sequelize');
const RegisteredItem = require('../models/RegisteredItem');
const DeviceType = require('../models/DeviceType');
const Category = require('../models/Category');
const Manufacturer = require('../models/Manufacturer');
const DeviceModel = require('../models/DeviceModel');
const StatusChangeLog = require('../models/StatusChangeLog');
const { generateVerificationCode, hashVerificationCode } = require('../utils/verification-code');
const { generateItemVerificationQR } = require('../utils/qr-code');
const AppError = require('../utils/appError');
const { CATEGORIES, ITEM_TYPES_BY_NAME } = require('../config/item-catalog');
const { requireActiveSubscription, startPaymentTrial } = require('./subscription.service');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Find the device type for a registration. Uses device_type_id when it is a
 * known id; otherwise falls back to device_type_name (sent by the form), and
 * creates that type from the item catalog if the database does not have it.
 */
const resolveDeviceType = async ({ device_type_id: id, device_type_name: name }) => {
  if (id && UUID_PATTERN.test(String(id))) {
    const byId = await DeviceType.findByPk(id);
    if (byId) return byId;
  }
  if (!name) return null;

  const byName = await DeviceType.findOne({ where: { name: String(name) } });
  if (byName) return byName;

  const definition = ITEM_TYPES_BY_NAME.get(String(name));
  if (!definition) return null;

  const [category] = await Category.findOrCreate({
    where: { name: definition.category },
    defaults: { name: definition.category, ...CATEGORIES[definition.category] }
  });
  const [created] = await DeviceType.findOrCreate({
    where: { name: definition.name },
    defaults: {
      category_id: category.id,
      name: definition.name,
      display_name: definition.display_name,
      icon: definition.icon,
      description: definition.display_name,
      required_fields: definition.required_fields,
      has_serial_number: true,
      display_order: definition.display_order,
      is_active: true
    }
  });
  return created;
};

/**
 * Register a new item
 * Following the registration logic:
 * OWNER → Select Category → Select Device Type → Select Manufacturer → Enter Item Info → Upload Photos → VALIDATE → REGISTERED_ITEMS → Generate verification code
 */
const registerItem = async (user, itemData) => {
  requireActiveSubscription(user);

  // 1) Validate device type configuration
  const deviceType = await resolveDeviceType(itemData);

  if (!deviceType) {
    throw new AppError('Device type not found', 404);
  }
  itemData.device_type_id = deviceType.id;

  // registered_items.model is required, but document forms (passport,
  // national ID) have no model field and it can be left blank elsewhere.
  if (!itemData.model || !String(itemData.model).trim()) {
    itemData.model = deviceType.display_name;
  }

  if (!deviceType.is_active) {
    throw new AppError('This device type is not available for registration', 400);
  }

  // 2) Validate required fields based on device type configuration
  const requiredFields = (deviceType.required_fields || [])
    .filter((field) => field !== 'manufacturer_id');
  for (const field of requiredFields) {
    if (!itemData[field] && !itemData[`${field}_url`]) {
      throw new AppError(`Field "${field}" is required for ${deviceType.display_name}`, 400);
    }
  }

  // 3) Validate identifier pattern if device type has unique identifier
  if (deviceType.has_unique_identifier && deviceType.identifier_pattern) {
    const identifierField = deviceType.name === 'phone' ? 'imei_number'
      : ['car', 'motorcycle', 'truck', 'van', 'bus'].includes(deviceType.name) ? 'vin_number'
      : deviceType.name === 'national_id' ? 'id_number'
      : deviceType.name === 'passport' ? 'passport_number'
      : null;

    if (identifierField && itemData[identifierField]) {
      const pattern = new RegExp(deviceType.identifier_pattern);
      if (!pattern.test(itemData[identifierField])) {
        throw new AppError(deviceType.identifier_validation_message || 'Invalid identifier format', 400);
      }
    }
  }

  // 4) Check for duplicate identifiers
  const identifiers = ['serial_number', 'imei_number', 'vin_number', 'id_number', 'passport_number'];
  for (const field of identifiers) {
    if (itemData[field]) {
      const existing = await RegisteredItem.findOne({ where: { [field]: itemData[field] } });
      if (existing) {
        throw new AppError(`This ${field.replace('_', ' ')} is already registered`, 409);
      }
    }
  }

  // 5) Generate verification code (unique)
  let verificationCode;
  let isUnique = false;
  while (!isUnique) {
    verificationCode = generateVerificationCode();
    const existing = await RegisteredItem.findOne({ where: { verification_code: verificationCode } });
    if (!existing) isUnique = true;
  }

  // 6) Generate QR code for verification
  // const qrCode = await generateItemVerificationQR(verificationCode, 'pending');

  // 7) Create the registered item
  const item = await RegisteredItem.create({
    ...itemData,
    user_id: user.id,
    verification_code: verificationCode,
    verification_code_hash: hashVerificationCode(verificationCode),
    ownership_start_date: new Date(),
    status: 'active',
    is_verified: false,
    trust_score: 0
  });

  // 8) Log the initial status
  await StatusChangeLog.create({
    item_id: item.id,
    previous_status: 'new',
    new_status: 'active',
    changed_by: user.id,
    reason: 'Item registered',
    metadata: { device_type: deviceType.name }
  });

  await startPaymentTrial(user);

  return { item, verificationCode };
};

/**
 * Get all items for a user
 */
const getMyItems = async (userId, query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const where = { user_id: userId };

  // Filter by status
  if (query.status) {
    where.status = query.status;
  }

  const { count, rows } = await RegisteredItem.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: DeviceType,
        as: 'deviceType',
        attributes: ['id', 'name', 'display_name', 'icon']
      },
      {
        model: Manufacturer,
        as: 'manufacturer',
        attributes: ['id', 'name', 'display_name']
      }
    ]
  });

  return {
    items: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

/**
 * Get public lost and stolen item cards without owner or identifier data.
 */
const getPublicLostItems = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = Math.min(parseInt(query.limit, 10) || 12, 50);
  const offset = (page - 1) * limit;

  const { count, rows } = await RegisteredItem.findAndCountAll({
    where: {
      status: { [Op.in]: ['lost', 'stolen'] },
      is_public: true
    },
    attributes: [
      'id', 'item_name', 'model', 'status', 'country', 'city', 'province',
      'district', 'sector', 'notes', 'front_image_url', 'back_image_url',
      'serial_image_url', 'created_at'
    ],
    include: [{
      model: DeviceType,
      as: 'deviceType',
      attributes: ['display_name', 'icon'],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'display_name']
      }]
    }],
    limit,
    offset,
    order: [['updated_at', 'DESC']]
  });

  return {
    items: rows.map((item) => ({
      id: item.id,
      item_name: item.item_name,
      model: item.model,
      status: item.status,
      category: item.deviceType?.category?.name || 'other',
      category_display_name: item.deviceType?.category?.display_name || 'Other items',
      icon: item.deviceType?.icon || '📦',
      location: {
        country: item.country,
        city: item.city,
        province: item.province,
        district: item.district,
        sector: item.sector
      },
      notes: item.notes,
      photo_url: item.front_image_url,
      reported_at: item.created_at
    })),
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
  };
};
/**
 * Get item by ID (for owner)
 */
const getItemById = async (itemId, userId) => {
  const item = await RegisteredItem.findOne({
    where: { id: itemId, user_id: userId },
    include: [
      {
        model: DeviceType,
        as: 'deviceType',
        include: [{ model: Category, as: 'category' }]
      },
      { model: Manufacturer, as: 'manufacturer' }
    ]
  });

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  return item;
};

/**
 * Update item details
 */
const updateItem = async (itemId, userId, updateData) => {
  const item = await RegisteredItem.findOne({
    where: { id: itemId, user_id: userId }
  });

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // Only allow updating certain fields
  const allowedFields = [
    'item_name', 'model', 'notes', 'is_public',
    'serial_number', 'imei_number', 'vin_number',
    'cost', 'currency', 'purchase_date', 'purchase_store_name', 'status'
  ];

  const filteredData = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  const previousStatus = item.status;
  await item.update(filteredData);

  if (filteredData.status && filteredData.status !== previousStatus) {
    await StatusChangeLog.create({
      item_id: item.id,
      previous_status: previousStatus,
      new_status: filteredData.status,
      changed_by: userId,
      reason: 'Item status updated by owner'
    });
  }

  return item;
};

/**
 * Delete item (soft delete)
 */
const deleteItem = async (itemId, userId) => {
  const item = await RegisteredItem.findOne({
    where: { id: itemId, user_id: userId }
  });

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // Log status change
  await StatusChangeLog.create({
    item_id: item.id,
    previous_status: item.status,
    new_status: 'deleted',
    changed_by: userId,
    reason: 'Item deleted by owner'
  });

  await item.update({ status: 'deleted' });
  await item.destroy();

  return { message: 'Item deleted successfully' };
};

/**
 * Search registered items by identifier (for verification/found matching)
 */
const findByIdentifier = async (identifier, type) => {
  const validTypes = ['serial_number', 'imei_number', 'vin_number', 'id_number', 'passport_number', 'license_plate', 'verification_code'];

  if (!validTypes.includes(type)) {
    throw new AppError('Invalid identifier type', 400);
  }

  // Check verification_code by hash
  let where = {};
  if (type === 'verification_code') {
    where.verification_code_hash = hashVerificationCode(identifier);
  } else {
    where[type] = identifier;
  }

  const item = await RegisteredItem.findOne({
    where,
    include: [
      {
        model: DeviceType,
        as: 'deviceType',
        attributes: ['id', 'name', 'display_name', 'icon']
      },
      {
        model: Manufacturer,
        as: 'manufacturer',
        attributes: ['id', 'name', 'display_name']
      },
      {
        model: StatusChangeLog,
        as: 'statusLogs',
        attributes: ['previous_status', 'new_status', 'reason', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 10
      }
    ]
  });

  return item;
};

module.exports = {
  registerItem,
  resolveDeviceType,
  getMyItems,
  getPublicLostItems,
  getItemById,
  updateItem,
  deleteItem,
  findByIdentifier
};
