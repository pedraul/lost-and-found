/**
 * Encrypts payment rows that were stored before AES encryption was enabled, and
 * re-encrypts rows still under an old key after PAYMENT_ENCRYPTION_KEY is rotated.
 *
 * Safe to run repeatedly: rows already encrypted with the current key are skipped.
 *
 *   npm run migrate            # first, so the columns are TEXT and the hash column exists
 *   npm run encrypt:payments
 */
const { sequelize } = require('../src/config/database');
const {
  encrypt, decrypt, decryptJson, encryptJson, lookupHash, isEncrypted, needsReencryption, assertEncryptionConfigured
} = require('../src/utils/encryption');

const FIELDS = ['phone_number', 'provider_reference', 'provider_payload'];

const needsWork = (row) => FIELDS.some((field) => {
  const value = row[field];
  if (value === null || value === undefined) return false;
  return !isEncrypted(value) || needsReencryption(value);
}) || (row.provider_reference && !row.provider_reference_hash);

const encryptPayments = async ({ exitOnFinish = true } = {}) => {
  assertEncryptionConfigured();
  const [rows] = await sequelize.query(
    'SELECT id, phone_number, provider_reference, provider_reference_hash, provider_payload::text AS provider_payload FROM payments'
  );

  let updated = 0;
  for (const row of rows) {
    if (!needsWork(row)) continue;

    const phone = decrypt(row.phone_number, 'payments.phone_number');
    const reference = decrypt(row.provider_reference, 'payments.provider_reference');
    const payload = decryptJson(row.provider_payload, 'payments.provider_payload');

    await sequelize.query(
      `UPDATE payments
         SET phone_number = :phone,
             provider_reference = :reference,
             provider_reference_hash = :referenceHash,
             provider_payload = :payload
       WHERE id = :id`,
      {
        replacements: {
          id: row.id,
          phone: encrypt(phone, 'payments.phone_number'),
          reference: encrypt(reference, 'payments.provider_reference'),
          referenceHash: lookupHash(reference),
          payload: payload === null || payload === undefined ? null : encryptJson(payload, 'payments.provider_payload')
        }
      }
    );
    updated += 1;
  }

  console.log(`Payment encryption: ${updated} of ${rows.length} row(s) encrypted or re-keyed.`);
  if (exitOnFinish) process.exit(0);
  return updated;
};

if (require.main === module) {
  encryptPayments().catch((error) => {
    console.error('Payment encryption failed:', error.message);
    process.exit(1);
  });
}

module.exports = { encryptPayments };
