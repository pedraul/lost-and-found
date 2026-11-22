const { Op } = require('sequelize');
const RegisteredItem = require('../models/RegisteredItem');
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const DeviceType = require('../models/DeviceType');
const Manufacturer = require('../models/Manufacturer');
const StatusChangeLog = require('../models/StatusChangeLog');
const AppError = require('../utils/appError');
const { hashVerificationCode } = require('../utils/verification-code');

/**
 * Helper: Map device type to its identifier field
 */
const getIdentifierField = (deviceTypeName) => {
  const identifierFields = {
    phone: 'imei_number',
    car: 'vin_number',
    motorcycle: 'vin_number',
    truck: 'vin_number',
    van: 'vin_number',
    bus: 'vin_number',
    bicycle: 'serial_number',
    watch: 'serial_number',
    speaker: 'serial_number',
    laptop: 'serial_number',
    tablet: 'serial_number',
    national_id: 'id_number',
    passport: 'passport_number'
  };

  return identifierFields[deviceTypeName] || 'serial_number';
};

/**
 * Helper: Calculate a confidence score (0-100) for a match
 * Based on device type match, identifier match, model match
 */
const calculateConfidenceScore = (foundItem, registeredItem) => {
  let score = 0;

  // Device type/category match (40 points)
  if (foundItem.deviceType && registeredItem.deviceType) {
    if (foundItem.deviceType.id === registeredItem.deviceType.id) {
      score += 40;
    } else if (foundItem.deviceType.category_id === registeredItem.deviceType.category_id) {
      score += 20;
    }
  }

  // Identifier match (40 points)
  const identifierField = getIdentifierField(foundItem.deviceType?.name);
  if (identifierField && foundItem[identifierField] && registeredItem[identifierField]) {
    if (foundItem[identifierField] === registeredItem[identifierField]) {
      score += 40;
    }
  }

  // Manufacturer match (10 points)
  if (foundItem.manufacturer_id && registeredItem.manufacturer_id) {
    if (foundItem.manufacturer_id === registeredItem.manufacturer_id) {
      score += 10;
    }
  }

  // Model match (10 points)
  if (foundItem.model && registeredItem.model) {
    if (foundItem.model.toLowerCase() === registeredItem.model.toLowerCase()) {
      score += 10;
    }
  }

  return score;
};

/**
 * Find potential matches for a found item
 * Logic: FINDER → Search identifier → Is item registered?
 *   ├── YES → potential owner found → create found item
 *   └── NO → create found item
 */
const findPotentialMatches = async (foundItemId) => {
  const foundItem = await FoundItem.findByPk(foundItemId, {
    include: [
      { model: DeviceType, as: 'deviceType' },
      { model: Manufacturer, as: 'manufacturer' }
    ]
  });

  if (!foundItem) {
    throw new AppError('Found item not found', 404);
  }

  const matches = [];

  // 1) Try matching by verification code hash
  const hashedCode = hashVerificationCode(foundItem.found_verification_code);
  const registeredByCode = await RegisteredItem.findAll({
    where: { verification_code_hash: hashedCode },
    include: [
      { model: DeviceType, as: 'deviceType', attributes: ['id', 'name', 'display_name', 'icon'] },
      { model: Manufacturer, as: 'manufacturer', attributes: ['id', 'name', 'display_name'] }
    ]
  });

  for (const registeredItem of registeredByCode) {
    matches.push({
      registeredItem,
      confidenceScore: 100,
      matchReason: 'Exact verification code match'
    });
  }

  // 2) If no verification code match, try identifier match
  if (matches.length === 0) {
    const identifierField = getIdentifierField(foundItem.deviceType?.name);

    if (identifierField && foundItem[identifierField]) {
      const registeredByIdentifier = await RegisteredItem.findAll({
        where: {
          [identifierField]: foundItem[identifierField],
          status: { [Op.in]: ['active', 'lost', 'stolen'] }
        },
        include: [
          { model: DeviceType, as: 'deviceType', attributes: ['id', 'name', 'display_name', 'icon'] },
          { model: Manufacturer, as: 'manufacturer', attributes: ['id', 'name', 'display_name'] }
        ]
      });

      for (const registeredItem of registeredByIdentifier) {
        const confidence = calculateConfidenceScore(foundItem, registeredItem);
        matches.push({
          registeredItem,
          confidenceScore: confidence,
          matchReason: `Identifier match (${identifierField})`
        });
      }
    }
  }

  return {
    foundItem,
    matches
  };
};

/**
 * Get all matches for a user
 */
const getMatchesForUser = async (userId, query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const where = {};

  // Filter by status
  if (query.status) {
    where.status = query.status;
  }

  const { count, rows } = await Match.findAndCountAll({
    where,
    offset,
    limit,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: FoundItem,
        as: 'foundItem',
        attributes: ['id', 'item_name', 'status', 'found_location', 'found_date']
      },
      {
        model: RegisteredItem,
        as: 'registeredItem',
        attributes: ['id', 'item_name', 'model', 'status']
      }
    ]
  });

  return {
    matches: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

/**
 * Update match status (accept/reject)
 * @param {string} matchId - The match ID
 * @param {string} status - 'pending' | 'confirmed' | 'rejected' | 'expired'
 * @param {string} changedBy - User ID making the change
 * @param {string} reason - Optional reason for the change
 */
const updateMatchStatus = async (matchId, status, changedBy, reason) => {
  const match = await Match.findByPk(matchId);

  if (!match) {
    throw new AppError('Match not found', 404);
  }

  if (!['pending', 'confirmed', 'rejected', 'expired'].includes(status)) {
    throw new AppError('Invalid match status', 400);
  }

  await match.update({
    status,
    notified_owner_at: status === 'confirmed' ? new Date() : match.notified_owner_at,
    notified_finder_at: status === 'confirmed' ? new Date() : match.notified_finder_at
  });

  // Log status change
  await StatusChangeLog.create({
    item_id: match.id,
    item_type: 'match',
    previous_status: match.status,
    new_status: status,
    changed_by: changedBy,
    reason: reason || 'Match status updated',
    metadata: { update_reason: reason || null }
  });

  // If confirmed, update the found item status to 'matched'
  if (status === 'confirmed') {
    await FoundItem.update(
      { status: 'matched', matched_item_id: match.registered_item_id },
      { where: { id: match.found_item_id } }
    );

    // Also update the registered item status if it was lost/stolen
    await RegisteredItem.update(
      { status: 'returned' },
      { where: { id: match.registered_item_id, status: { [Op.in]: ['lost', 'stolen'] } } }
    );
  }

  return match;
};

module.exports = {
  findPotentialMatches,
  getMatchesForUser,
  updateMatchStatus
};