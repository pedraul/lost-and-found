const { Op } = require('sequelize');
const FoundItem = require('../models/FoundItem');
const RegisteredItem = require('../models/RegisteredItem');
const Category = require('../models/Category');
const DeviceType = require('../models/DeviceType');
const Manufacturer = require('../models/Manufacturer');
const StatusChangeLog = require('../models/StatusChangeLog');
const { generateVerificationCode, hashVerificationCode } = require('../utils/verification-code');
const { generateQRCode } = require('../utils/qr-code');
const AppError = require('../utils/appError');

/**
 * Report a found item
 * Logic: FINDER → Search identifier → Is item registered?
 *   ├── YES → potential owner found → create found item
 *   └── NO → create found item
 */
const reportFoundItem = async (reporter, foundData) => {
  const reportDate = foundData.found_date || new Date().toISOString().slice(0, 10);
  foundData.found_date = reportDate;

  // 1) Validate required fields
  const requiredFields = ['item_name', 'found_location', 'found_date', 'overall_image_url', 'serial_image_url'];
  for (const field of requiredFields) {
    if (!foundData[field]) {
      throw new AppError(`Field "${field}" is required for found item`, 400);
    }
  }

  const reporterName = reporter?.full_name || foundData.reporter_name;
  const reporterEmail = reporter?.email || foundData.reporter_email || null;
  const reporterPhone = foundData.reporter_phone || reporter?.phone || null;

  if (!reporterName || (!reporterEmail && !reporterPhone)) {
    throw new AppError('Reporter name and either email or phone are required', 400);
  }

  // 2) Generate verification code
  const verificationCode = generateVerificationCode();

  // 3) Create found item record
  const foundItem = await FoundItem.create({
    ...foundData,
    item_category: foundData.item_category || 'other',
    found_date: foundData.found_date || new Date().toISOString().slice(0, 10),
    reporter_id: reporter?.id || null,
    reporter_name: reporterName,
    reporter_email: reporterEmail,
    reporter_phone: reporterPhone,
    found_verification_code: verificationCode,
    found_verification_hash: hashVerificationCode(verificationCode),
    status: 'pending',
    is_public: true,
    show_reporter_contact: false
  });

  // 4) Log the initial status
  await StatusChangeLog.create({
    found_item_id: foundItem.id,
    item_type: 'found_item',
    previous_status: 'new',
    new_status: 'pending',
    changed_by: reporter?.id || null,
    reason: 'Found item reported by finder',
    metadata: { device_type: foundData.device_type_name || null }
  });

  return { foundItem, verificationCode };
};

/**
 * Get found items with filters
 */
const getFoundItems = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const where = {};

  // Filter by status
  if (query.status) {
    where.status = query.status;
  }

  // Filter by category
  if (query.category) {
    where.item_category = query.category;
  }

  // Filter by manufacturer
  if (query.manufacturer) {
    where.brand = query.manufacturer;
  }

  // Filter by date range
  if (query.from_date || query.to_date) {
    where.found_date = {};
    if (query.from_date) {
      where.found_date[Op.gte] = query.from_date;
    }
    if (query.to_date) {
      where.found_date[Op.lte] = query.to_date;
    }
  }

  const { count, rows } = await FoundItem.findAndCountAll({
    where,
    attributes: [
      'id',
      'item_name',
      'item_category',
      'item_description',
      'condition',
      'color',
      'brand',
      'model',
      'found_location',
      'found_address',
      'found_city',
      'found_district',
      'found_sector',
      'found_country',
      'found_date',
      'reporter_phone',
      'status',
      'matched_item_id',
      'matched_at',
      'match_confidence_score',
      'overall_image_url',
      'created_at'
    ],
    include: [{
      model: RegisteredItem,
      as: 'matchedItem',
      attributes: ['front_image_url', 'back_image_url', 'serial_image_url']
    }],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    items: rows.map((item) => {
      const data = item.toJSON();
      return {
        ...data,
        photo_url: data.matchedItem?.front_image_url || data.overall_image_url
      };
    }),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

/**
 * Get found item by ID
 */
const getFoundItemById = async (itemId) => {
  const item = await FoundItem.findByPk(itemId, {
    attributes: [
      'id',
      'item_name',
      'item_category',
      'item_description',
      'condition',
      'color',
      'brand',
      'model',
      'found_location',
      'found_address',
      'found_city',
      'found_district',
      'found_sector',
      'found_country',
      'found_date',
      'reporter_phone',
      'status',
      'matched_item_id',
      'matched_at',
      'match_confidence_score',
      'overall_image_url',
      'created_at'
    ],
  });

  if (!item) {
    throw new AppError('Found item not found', 404);
  }

  return item;
};

/**
 * Verify found item (match to registered item)
 */
const markAsMatched = async (itemId, registeredItemId, matchedBy, confidenceScore) => {
  const item = await FoundItem.findByPk(itemId);

  if (!item) {
    throw new AppError('Found item not found', 404);
  }

  await item.update({
    status: 'matched',
    matched_item_id: registeredItemId,
    matched_by: matchedBy,
    matched_at: new Date(),
    match_confidence_score: confidenceScore || null
  });

  await StatusChangeLog.create({
    found_item_id: item.id,
    item_type: 'found_item',
    previous_status: 'pending',
    new_status: 'matched',
    changed_by: matchedBy,
    reason: 'Item matched to registered item',
    metadata: { registered_item_id: registeredItemId, confidence_score: confidenceScore }
  });

  return item;
};

/**
 * Claim a found item
 */
const claimFoundItem = async (itemId, claimData) => {
  const item = await FoundItem.findByPk(itemId);

  if (!item) {
    throw new AppError('Found item not found', 404);
  }

  if (item.status !== 'matched') {
    throw new AppError('Item is not in matched status and cannot be claimed', 400);
  }

  await item.update({
    status: 'claimed',
    claimed_by: claimData.claimantId,
    claim_status: 'pending_review',
    claimed_at: new Date(),
    claim_notes: claimData.claimNotes,
    claim_proof_details: claimData.claimProofDetails
  });

  await StatusChangeLog.create({
    found_item_id: item.id,
    item_type: 'found_item',
    previous_status: item.status,
    new_status: 'claimed',
    changed_by: claimData.claimantId,
    reason: 'Item claimed by potential owner'
  });

  return item;
};

module.exports = {
  reportFoundItem,
  getFoundItems,
  getFoundItemById,
  markAsMatched,
  claimFoundItem
};