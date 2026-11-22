const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Audit trail of everything that happens on the platform: user and admin
// actions (recorded automatically per request), and system events such as
// Paypack payment confirmations. Written via services/audit-log.service.js.
const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // The account the entry concerns. Nullable for guests, failed logins and
  // system events; SET NULL on delete so the audit trail outlives the account
  // (actor_email/actor_name keep who it was).
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  actor_role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'user',
    comment: 'user, admin, guest or system'
  },
  actor_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  actor_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'other',
    comment: 'payment, account, item, found_item, match, verification, search, report, admin, security, other'
  },
  action_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'e.g. payment_checkout_started, user_login, item_registered'
  },
  resource_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'e.g. payment, registered_item, found_item, match, verification, user'
  },
  resource_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  outcome: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'success',
    validate: { isIn: [['success', 'failure']] }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  http_method: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status_code: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'activity_logs',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['created_at'] },
    { fields: ['user_id'] },
    { fields: ['category'] },
    { fields: ['action_type'] },
    { fields: ['outcome'] },
    { fields: ['resource_id'] }
  ]
});

module.exports = ActivityLog;
