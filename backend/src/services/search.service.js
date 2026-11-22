const { Op } = require('sequelize');
const RegisteredItem = require('../models/RegisteredItem');
const FoundItem = require('../models/FoundItem');
const Category = require('../models/Category');
const DeviceType = require('../models/DeviceType');
const Manufacturer = require('../models/Manufacturer');
const StatusChangeLog = require('../models/StatusChangeLog');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { hashVerificationCode } = require('../utils/verification-code');

/**
 * SEARCH SERVICE
 * Searches registered items by identifiers (serial, IMEI, VIN, verification code), plus found items.
 */
const searchItems = async (query) => {
  const { identifier, identifier_type, limit = 10, offset = 0 } = query;

  if (!identifier || !identifier_type) {
    throw new AppError('Identifier and identifier_type are required', 400);
  }

  const validTypes = ['serial_number', 'imei_number', 'vin_number', 'id_number', 'passport_number', 'license_plate', 'verification_code'];
  if (!validTypes.includes(identifier_type)) {
    throw new AppError('Invalid identifier_type', 400);
  }

  // Build where clause based on identifier type
  const where = {};
  where[identifier_type] = identifier;

  const registeredItems = await RegisteredItem.findAll({
    where,
    attributes: [
      'id',
      'item_name',
      'model',
      'status',
      'country',
      'city',
      'province',
      'district',
      'sector',
      'phone_number',
      'front_image_url',
      'back_image_url',
      'serial_image_url'
    ],
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['full_name', 'phone']
      }
    ],
    limit: 10
  });

  return {
    registeredItems: registeredItems.map((item) => ({
      id: item.id,
      item_name: item.item_name,
      model: item.model,
      status: item.status,
      photo_url: item.front_image_url,
      owner: item.owner ? {
        name: item.owner.full_name,
        phone: item.owner.phone || item.phone_number || null
      } : null,
      location: {
        country: item.country,
        city: item.city,
        province: item.province,
        district: item.district,
        sector: item.sector
      }
    }))
  };
};

/**
 * Search found items (by verification code / matching registered via code)
 */
const searchFoundItems = async (verificationCode) => {
  if (!verificationCode) {
    throw new AppError('Verification code is required', 400);
  }

  const hash = hashVerificationCode(verificationCode);

  const items = await FoundItem.findAll({
    where: { found_verification_hash: hash },
    attributes: [
      'id',
      'item_name',
      'item_category',
      'item_description',
      'found_location',
      'found_city',
      'found_country',
      'found_date',
      'status',
      'matched_item_id',
      'matched_at',
      'match_confidence_score',
      'overall_image_url'
    ],
  });

  return { items };
};

module.exports = {
  searchItems,
  searchFoundItems
};
