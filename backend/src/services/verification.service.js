const { Op } = require('sequelize');
const RegisteredItem = require('../models/RegisteredItem');
const FoundItem = require('../models/FoundItem');
const StatusChangeLog = require('../models/StatusChangeLog');
const VerificationLog = require('../models/VerificationLog');
const AppError = require('../utils/appError');

const createVerification = async (verifierId, itemId, data) => {
  const item = await FoundItem.findByPk(itemId);

  if (!item) {
    throw new AppError('Found item not found', 404);
  }

  const log = await VerificationLog.create({
    item_id: itemId,
    verifier_id: verifierId,
    verification_code: data.verification_code || item.found_verification_code,
    verification_method: data.method || 'manual',
    result: 'success',
    notes: data.notes
  });

  await StatusChangeLog.create({
    item_id: itemId,
    item_type: 'found_item',
    previous_status: item.status,
    new_status: data.status || item.status,
    changed_by: verifierId,
    reason: 'Verification created',
    metadata: { verification_id: log.id }
  });

  return log;
};

const verifyWithCode = async (verificationCode, itemId) => {
  const item = await FoundItem.findOne({
    where: {
      found_verification_code: verificationCode,
      ...(itemId && { id: itemId })
    }
  });

  if (!item) {
    throw new AppError('Invalid verification code', 404);
  }

  const log = await VerificationLog.create({
    item_id: item.id,
    verification_code: verificationCode,
    verification_method: 'qr_code',
    result: 'success',
    verified_at: new Date()
  });

  return {
    success: true,
    item: {
      id: item.id,
      item_name: item.item_name,
      status: item.status,
      verified_at: log.verified_at
    }
  };
};

const getVerificationStatus = async (itemId) => {
  const logs = await VerificationLog.findAll({
    where: { item_id: itemId },
    order: [['verified_at', 'DESC']]
  });

  const latest = logs[0];

  return {
    item_id: itemId,
    total_verifications: logs.length,
    latest_result: latest ? latest.result : 'pending',
    latest_verified_at: latest ? latest.verified_at : null
  };
};

module.exports = {
  createVerification,
  verifyWithCode,
  getVerificationStatus
};