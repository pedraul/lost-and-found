const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StatusChangeLog = sequelize.define('StatusChangeLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  item_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'registered_items',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  found_item_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'found_items',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  previous_status: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  new_status: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  changed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'status_change_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['item_id'] },
    { fields: ['new_status'] }
  ]
});

module.exports = StatusChangeLog;