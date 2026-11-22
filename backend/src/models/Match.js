const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  found_item_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'found_items',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  registered_item_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'registered_items',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  confidence_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  match_reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  match_method: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'identifier'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'confirmed', 'rejected', 'expired']]
    }
  },
  notified_owner_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notified_finder_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'matches',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['found_item_id'] },
    { fields: ['registered_item_id'] },
    { fields: ['status'] }
  ]
});

module.exports = Match;