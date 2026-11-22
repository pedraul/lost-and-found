const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VerificationLog = sequelize.define('VerificationLog', {
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
  verifier_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  verification_code: {
    type: DataTypes.STRING(19),
    allowNull: false
  },
  verification_method: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  result: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['success', 'failed', 'pending']]
    }
  },
  failure_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  verified_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'verification_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['item_id'] },
    { fields: ['verification_code'] },
    { fields: ['result'] }
  ]
});

module.exports = VerificationLog;