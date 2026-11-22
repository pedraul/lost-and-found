const User = require('./User');
const Category = require('./Category');
const DeviceType = require('./DeviceType');
const Manufacturer = require('./Manufacturer');
const DeviceModel = require('./DeviceModel');
const RegisteredItem = require('./RegisteredItem');
const FoundItem = require('./FoundItem');
const Match = require('./Match');
const StatusChangeLog = require('./StatusChangeLog');
const VerificationLog = require('./VerificationLog');
const ItemTransaction = require('./ItemTransaction');
const ActivityLog = require('./ActivityLog');
const Payment = require('./Payment');
const PaymentSetting = require('./PaymentSetting');

// =============================================
// ASSOCIATIONS
// =============================================

// User associations
User.hasMany(RegisteredItem, { foreignKey: 'user_id', as: 'registeredItems' });
RegisteredItem.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

User.hasMany(FoundItem, { foreignKey: 'reporter_id', as: 'foundItems' });
FoundItem.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });

FoundItem.belongsTo(User, { foreignKey: 'claimed_by', as: 'claimant' });
FoundItem.belongsTo(User, { foreignKey: 'returned_to', as: 'returnedUser' });
FoundItem.belongsTo(User, { foreignKey: 'matched_by', as: 'matchedBy' });

// Category associations
Category.hasMany(DeviceType, { foreignKey: 'category_id', as: 'deviceTypes' });
DeviceType.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Manufacturer associations
Manufacturer.hasMany(DeviceModel, { foreignKey: 'manufacturer_id', as: 'deviceModels' });
DeviceModel.belongsTo(Manufacturer, { foreignKey: 'manufacturer_id', as: 'manufacturer' });

Manufacturer.hasMany(RegisteredItem, { foreignKey: 'manufacturer_id', as: 'items' });
RegisteredItem.belongsTo(Manufacturer, { foreignKey: 'manufacturer_id', as: 'manufacturer' });

// DeviceType associations
DeviceType.hasMany(RegisteredItem, { foreignKey: 'device_type_id', as: 'items' });
RegisteredItem.belongsTo(DeviceType, { foreignKey: 'device_type_id', as: 'deviceType' });

// RegisteredItem associations
RegisteredItem.hasMany(FoundItem, { foreignKey: 'matched_item_id', as: 'foundMatches' });
FoundItem.belongsTo(RegisteredItem, { foreignKey: 'matched_item_id', as: 'matchedItem' });

RegisteredItem.belongsTo(User, { foreignKey: 'previous_owner_id', as: 'previousOwner' });

RegisteredItem.hasMany(StatusChangeLog, { foreignKey: 'item_id', as: 'statusLogs' });
StatusChangeLog.belongsTo(RegisteredItem, { foreignKey: 'item_id', as: 'item' });

RegisteredItem.hasMany(VerificationLog, { foreignKey: 'item_id', as: 'verificationLogs' });
VerificationLog.belongsTo(RegisteredItem, { foreignKey: 'item_id', as: 'item' });

RegisteredItem.hasMany(ItemTransaction, { foreignKey: 'item_id', as: 'transactions' });
ItemTransaction.belongsTo(RegisteredItem, { foreignKey: 'item_id', as: 'registeredItem' });

// FoundItem associations
FoundItem.hasMany(Match, { foreignKey: 'found_item_id', as: 'matches' });
Match.belongsTo(FoundItem, { foreignKey: 'found_item_id', as: 'foundItem' });

// Match associations
RegisteredItem.hasMany(Match, { foreignKey: 'registered_item_id', as: 'matches' });
Match.belongsTo(RegisteredItem, { foreignKey: 'registered_item_id', as: 'registeredItem' });

// ActivityLog associations
// SET NULL (not CASCADE) so deleting an account keeps its audit trail.
User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activities', onDelete: 'SET NULL' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'SET NULL' });

User.hasMany(VerificationLog, { foreignKey: 'verifier_id', as: 'verifications' });
VerificationLog.belongsTo(User, { foreignKey: 'verifier_id', as: 'verifier' });

User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  Category,
  DeviceType,
  Manufacturer,
  DeviceModel,
  RegisteredItem,
  FoundItem,
  Match,
  StatusChangeLog,
  VerificationLog,
  ItemTransaction,
  ActivityLog,
  Payment,
  PaymentSetting
};