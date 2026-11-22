const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ItemTransaction = sequelize.define('ItemTransaction', {
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
  transaction_type: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  from_user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  to_user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  transaction_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'item_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['item_id'] },
    { fields: ['transaction_type'] }
  ]
});

module.exports = ItemTransaction;