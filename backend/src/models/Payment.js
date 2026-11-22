const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { encrypt, decrypt, encryptJson, decryptJson, lookupHash, lookupHashCandidates } = require('../utils/encryption');

// Sensitive transaction fields (payer phone number, Paypack reference and the raw
// Paypack response) are stored AES-256-GCM encrypted. The getters/setters below
// make this transparent: code reads and writes plaintext, the database only
// ever sees ciphertext. Amount, currency, status and dates stay in clear text
// because admin revenue reports aggregate them in SQL.
const encryptedString = (field) => ({
  get() {
    return decrypt(this.getDataValue(field), `payments.${field}`);
  },
  set(value) {
    this.setDataValue(field, encrypt(value, `payments.${field}`));
  }
});

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  provider: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'paypack'
  },
  provider_reference: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      return decrypt(this.getDataValue('provider_reference'), 'payments.provider_reference');
    },
    set(value) {
      this.setDataValue('provider_reference', encrypt(value, 'payments.provider_reference'));
      this.setDataValue('provider_reference_hash', lookupHash(value));
    }
  },
  // HMAC-SHA256 of the plaintext reference: lets webhooks find a payment by
  // reference without decrypting every row. Use Payment.findByProviderReference.
  provider_reference_hash: {
    type: DataTypes.STRING(64),
    allowNull: true,
    unique: true
  },
  idempotency_key: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  duration_months: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 12,
    validate: { min: 1, max: 12 }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'RWF'
  },
  phone_number: {
    type: DataTypes.TEXT,
    allowNull: false,
    ...encryptedString('phone_number')
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'successful', 'failed']] }
  },
  provider_payload: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      return decryptJson(this.getDataValue('provider_payload'), 'payments.provider_payload');
    },
    set(value) {
      this.setDataValue('provider_payload', encryptJson(value, 'payments.provider_payload'));
    }
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  confirmation_email_sent_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

/** Find a payment by its plaintext Paypack reference (the column itself is encrypted). */
Payment.findByProviderReference = (reference, options = {}) => Payment.findOne({
  ...options,
  where: {
    ...(options.where || {}),
    [Op.or]: [
      { provider_reference_hash: { [Op.in]: lookupHashCandidates(reference) } },
      // Rows created before encryption, not yet processed by `npm run encrypt:payments`.
      { provider_reference_hash: null, provider_reference: String(reference) }
    ]
  }
});

module.exports = Payment;
