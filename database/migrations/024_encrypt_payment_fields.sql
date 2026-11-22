-- Payment transactions: sensitive fields are stored AES-256-GCM encrypted by the
-- application (backend/src/utils/encryption.js). Ciphertext is longer than the
-- original values and is not JSON, so these columns become TEXT.
-- `npm run migrate` applies the same change through the Sequelize model and then
-- encrypts existing rows; this file documents it for manual SQL setups.
-- After applying it by hand, run `npm run encrypt:payments` in backend/.

ALTER TABLE payments
  ALTER COLUMN phone_number TYPE TEXT,
  ALTER COLUMN provider_reference TYPE TEXT,
  ALTER COLUMN provider_payload TYPE TEXT USING provider_payload::text;

-- HMAC-SHA256 of the plaintext Paypack reference, used to look payments up
-- (e.g. from webhooks) without decrypting every row.
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS provider_reference_hash VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_reference_hash_key
  ON payments (provider_reference_hash);

-- Encrypted values are random per write, so an index on the ciphertext is useless.
DROP INDEX IF EXISTS payments_provider_reference_idx;
