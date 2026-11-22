const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DeviceModel = sequelize.define('DeviceModel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  manufacturer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'manufacturers',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  model_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  model_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  year_start: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  year_end: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'device_models',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['manufacturer_id', 'model_name']
    }
  ]
});

module.exports = DeviceModel;