const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

module.exports = sequelize.define('PaymentSetting', {
  key: { type: DataTypes.STRING(50), primaryKey: true },
  value: { type: DataTypes.STRING(100), allowNull: false }
}, { tableName: 'payment_settings', timestamps: false });
