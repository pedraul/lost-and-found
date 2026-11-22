const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const FoundItem = sequelize.define('FoundItem', {
  // Primary Key
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  // Reporter Information
  reporter_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  reporter_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  reporter_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reporter_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  // Item Information (Required Fields)
  item_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  item_category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  item_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Identifiers (Conditional by Category)
  serial_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  imei_number: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  vin_number: {
    type: DataTypes.STRING(17),
    allowNull: true
  },
  passport_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  id_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  license_plate: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  frame_size: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  // Physical Attributes
  condition: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  distinctive_marks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  additional_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Found Location
  found_location: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  found_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  found_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  found_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  found_city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  found_district: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  found_sector: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  found_country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  // Found Date & Time
  found_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  found_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  found_datetime: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // Verification Code (Auto-generated)
  found_verification_code: {
    type: DataTypes.STRING(19),
    allowNull: false,
    unique: true
  },
  found_verification_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  qr_code_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },

  // Images (All Required)
  overall_image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  overall_file_name: {
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
  front_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  front_file_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  back_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  back_file_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  side_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  side_file_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  interior_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  interior_file_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  damage_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  damage_file_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  distinctive_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  distinctive_file_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  // Status Tracking
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'matched', 'claimed', 'returned', 'resolved', 'expired']]
    }
  },

  // Match Information
  matched_item_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'registered_items',
      key: 'id'
    }
  },
  matched_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  matched_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  match_confidence_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },

  // Claim Information
  claimed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  claimed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  claim_status: {
    type: DataTypes.STRING(30),
    allowNull: true,
    validate: {
      isIn: [['pending_review', 'approved', 'rejected', 'awaiting_return', 'completed']]
    }
  },
  claim_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  claim_proof_details: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Return Information
  returned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  returned_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  return_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Expiry Information
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_expired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // Security & Privacy
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  show_reporter_contact: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'found_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    // Primary indexes
    { fields: ['reporter_id'] },
    { fields: ['status'] },
    { fields: ['item_category'] },

    // Identifier indexes
    { fields: ['serial_number'], where: { serial_number: { [Op.ne]: null } } },
    { fields: ['imei_number'], where: { imei_number: { [Op.ne]: null } } },
    { fields: ['vin_number'], where: { vin_number: { [Op.ne]: null } } },
    { fields: ['passport_number'], where: { passport_number: { [Op.ne]: null } } },
    { fields: ['id_number'], where: { id_number: { [Op.ne]: null } } },
    { fields: ['license_plate'], where: { license_plate: { [Op.ne]: null } } },

    // Location indexes
    { fields: ['found_latitude', 'found_longitude'] },
    { fields: ['found_city'] },
    { fields: ['found_country'] },

    // Date indexes
    { fields: ['found_date'] },
    { fields: [{ name: 'created_at', order: 'DESC' }] },
    { fields: ['expires_at'], where: { expires_at: { [Op.ne]: null } } },

    // Match indexes
    { fields: ['matched_item_id'], where: { matched_item_id: { [Op.ne]: null } } },

    // Verification code index
    { fields: ['found_verification_code'] },

    // Claim indexes
    { fields: ['claimed_by'], where: { claimed_by: { [Op.ne]: null } } },
    { fields: ['claim_status'], where: { claim_status: { [Op.ne]: null } } }
  ]
});

module.exports = FoundItem;
