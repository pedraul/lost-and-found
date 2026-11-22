const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const RegisteredItem = sequelize.define('RegisteredItem', {
  // Primary Key
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },

  // Device Selection
  device_type_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'device_types',
      key: 'id'
    }
  },
  manufacturer_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'manufacturers',
      key: 'id'
    }
  },

  // Basic Information
  item_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  // Identifiers (Conditional based on device type)
  serial_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  imei_number: {
    type: DataTypes.STRING(15),
    allowNull: true,
    unique: true
  },
  vin_number: {
    type: DataTypes.STRING(17),
    allowNull: true,
    unique: true
  },
  id_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  passport_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  license_plate: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  frame_size: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  // Document Fields
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  issuing_country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  // Vehicle Fields
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  // Purchase Information
  cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  purchase_store_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  // Owner contact/location shown only after an exact identifier search
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  province: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  sector: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  // Required Images (All devices)
  receipt_image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  receipt_file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  front_image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  front_file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  back_image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  back_file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  serial_image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  serial_file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  // Additional Images (Device-specific)
  screen_image_url: { type: DataTypes.STRING(500), allowNull: true },
  screen_file_name: { type: DataTypes.STRING(255), allowNull: true },
  side_image_url: { type: DataTypes.STRING(500), allowNull: true },
  side_file_name: { type: DataTypes.STRING(255), allowNull: true },
  interior_image_url: { type: DataTypes.STRING(500), allowNull: true },
  interior_file_name: { type: DataTypes.STRING(255), allowNull: true },
  cargo_image_url: { type: DataTypes.STRING(500), allowNull: true },
  cargo_file_name: { type: DataTypes.STRING(255), allowNull: true },
  drivetrain_image_url: { type: DataTypes.STRING(500), allowNull: true },
  drivetrain_file_name: { type: DataTypes.STRING(255), allowNull: true },
  frame_image_url: { type: DataTypes.STRING(500), allowNull: true },
  frame_file_name: { type: DataTypes.STRING(255), allowNull: true },
  full_bike_image_url: { type: DataTypes.STRING(500), allowNull: true },
  full_bike_file_name: { type: DataTypes.STRING(255), allowNull: true },
  id_front_image_url: { type: DataTypes.STRING(500), allowNull: true },
  id_front_file_name: { type: DataTypes.STRING(255), allowNull: true },
  id_back_image_url: { type: DataTypes.STRING(500), allowNull: true },
  id_back_file_name: { type: DataTypes.STRING(255), allowNull: true },
  passport_photo_image_url: { type: DataTypes.STRING(500), allowNull: true },
  passport_photo_file_name: { type: DataTypes.STRING(255), allowNull: true },
  passport_id_image_url: { type: DataTypes.STRING(500), allowNull: true },
  passport_id_file_name: { type: DataTypes.STRING(255), allowNull: true },

  // Verification Code (Auto-generated)
  verification_code: {
    type: DataTypes.STRING(19),
    allowNull: false,
    unique: true
  },
  verification_code_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  qr_code_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },

  // Status
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'lost', 'stolen', 'returned', 'deleted', 'transferred']]
    }
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  trust_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  // Ownership
  ownership_start_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ownership_end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  previous_owner_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  transfer_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // Additional
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true
  }
}, {
  tableName: 'registered_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['device_type_id'] },
    { fields: ['manufacturer_id'] },
    { fields: ['status'] },
    { fields: ['serial_number'], where: { serial_number: { [Op.ne]: null } } },
    { fields: ['imei_number'], where: { imei_number: { [Op.ne]: null } } },
    { fields: ['vin_number'], where: { vin_number: { [Op.ne]: null } } },
    { fields: ['id_number'], where: { id_number: { [Op.ne]: null } } },
    { fields: ['passport_number'], where: { passport_number: { [Op.ne]: null } } },
    { fields: ['verification_code'] },
    { fields: [{ name: 'created_at', order: 'DESC' }] },
    { fields: ['tags'], using: 'gin' }
  ]
});

module.exports = RegisteredItem;
