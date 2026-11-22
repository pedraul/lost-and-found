const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DeviceType = sequelize.define('DeviceType', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  display_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Identifier Configuration
  has_serial_number: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  has_unique_identifier: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  identifier_label: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  identifier_placeholder: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  identifier_pattern: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  identifier_validation_message: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  // Required Fields Configuration (JSONB)
  required_fields: {
    type: DataTypes.JSONB,
    defaultValue: []
  },

  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'device_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DeviceType;