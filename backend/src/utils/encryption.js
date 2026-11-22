const crypto = require('crypto');

/**
 * Field-level encryption for sensitive data at rest (payment transactions).
 *
 * Algorithm: AES-256-GCM (authenticated encryption).
 *   - A fresh random 12-byte IV for every value, so equal plaintexts never
 *     produce equal ciphertexts.
 *   - The 16-byte GCM auth tag makes any tampering with the stored value fail
 *     loudly on decrypt instead of returning altered data.
 *   - The field name is bound in as additional authenticated data (AAD), so a
 *     ciphertext copied from one column into another will not decrypt.
 *
 * Stored format:  enc:v1:<keyId>:<iv>:<authTag>:<ciphertext>   (base64url parts)
 *
 * Keys:
 *   PAYMENT_ENCRYPTION_KEY            current 32-byte key, base64 or hex.
 *   PAYMENT_ENCRYPTION_PREVIOUS_KEYS  optional, comma-separated old keys that are
 *                                     still accepted for decryption (key rotation).
 * Generate a key with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

const PREFIX = 'enc:v1:';
const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;

const parseKey = (raw, name) => {
  const value = String(raw || '').trim();
  let key;
  if (/^[0-9a-fA-F]{64}$/.test(value)) key = Buffer.from(value, 'hex');
  else key = Buffer.from(value, 'base64');
  if (key.length !== 32) {
    throw new Error(`${name} must be a 32-byte key encoded as base64 or 64 hex characters.`);
  }
  return key;
};

// Short, non-secret identifier so each ciphertext records which key made it.
const keyIdOf = (key) => crypto.createHash('sha256').update(key).digest('hex').slice(0, 8);

let keyring;

const loadKeyring = () => {
  if (keyring) return keyring;
  if (!process.env.PAYMENT_ENCRYPTION_KEY) {
    throw new Error('PAYMENT_ENCRYPTION_KEY is not configured; payment data cannot be encrypted.');
  }
  const current = parseKey(process.env.PAYMENT_ENCRYPTION_KEY, 'PAYMENT_ENCRYPTION_KEY');
  const previous = String(process.env.PAYMENT_ENCRYPTION_PREVIOUS_KEYS || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => parseKey(entry, 'PAYMENT_ENCRYPTION_PREVIOUS_KEYS'));

  const byId = new Map();
  [current, ...previous].forEach((key) => byId.set(keyIdOf(key), key));

  // Separate sub-keys for lookup hashes, derived so an AES key itself is never
  // reused for a second purpose. Old keys' lookup keys are kept so rows that
  // have not been re-encrypted since a key rotation can still be found.
  const deriveLookupKey = (key) => Buffer.from(crypto.hkdfSync('sha256', key, Buffer.alloc(0), 'lookup-hash:v1', 32));
  const lookupKeys = [...byId.values()].map(deriveLookupKey);

  keyring = { currentId: keyIdOf(current), current, byId, lookupKey: lookupKeys[0], lookupKeys };
  return keyring;
};

const isEncrypted = (value) => typeof value === 'string' && value.startsWith(PREFIX);

const encrypt = (plaintext, context = '') => {
  if (plaintext === null || plaintext === undefined) return plaintext;
  const { current, currentId } = loadKeyring();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, current, iv);
  cipher.setAAD(Buffer.from(context, 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${currentId}:${iv.toString('base64url')}:${tag.toString('base64url')}:${ciphertext.toString('base64url')}`;
};

const decrypt = (value, context = '') => {
  // Rows written before encryption was enabled are returned unchanged until the
  // backfill script (npm run encrypt:payments) has processed them.
  if (!isEncrypted(value)) return value;
  const parts = value.slice(PREFIX.length).split(':');
  if (parts.length !== 4) throw new Error('Malformed encrypted value.');
  const [keyId, iv, tag, ciphertext] = parts;
  const key = loadKeyring().byId.get(keyId);
  if (!key) throw new Error(`No decryption key available for key id ${keyId}.`);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64url'));
  decipher.setAAD(Buffer.from(context, 'utf8'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8');
};

const encryptJson = (value, context) => (value === null || value === undefined ? value : encrypt(JSON.stringify(value), context));

const decryptJson = (value, context) => {
  if (value === null || value === undefined) return value;
  if (typeof value === 'object') return value; // legacy JSONB value
  const text = decrypt(value, context);
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

/** Deterministic keyed hash (HMAC-SHA256) so encrypted fields can still be looked up by exact value. */
const lookupHash = (value) => {
  if (value === null || value === undefined) return value;
  return crypto.createHmac('sha256', loadKeyring().lookupKey).update(String(value)).digest('hex');
};

/** Lookup hashes under the current and every previous key, for WHERE ... IN queries. */
const lookupHashCandidates = (value) => loadKeyring().lookupKeys
  .map((key) => crypto.createHmac('sha256', key).update(String(value)).digest('hex'));

/** True when the value was encrypted with an older key and should be re-encrypted. */
const needsReencryption = (value) => isEncrypted(value) && value.slice(PREFIX.length).split(':')[0] !== loadKeyring().currentId;

/** Fail fast at startup instead of on the first payment. */
const assertEncryptionConfigured = () => {
  loadKeyring();
};

// For tests that change environment variables.
const resetKeyring = () => {
  keyring = undefined;
};

module.exports = {
  encrypt,
  decrypt,
  encryptJson,
  decryptJson,
  lookupHash,
  lookupHashCandidates,
  isEncrypted,
  needsReencryption,
  assertEncryptionConfigured,
  resetKeyring
};
