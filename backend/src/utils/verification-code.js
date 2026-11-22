const crypto = require('crypto');

/**
 * Generates a unique verification code in format: XXXX-XXXX-XXXX-XXXX
 * Used for item registration verification (matches schema VARCHAR(19))
 */
const generateVerificationCode = () => {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
  }
  return segments.join('-');
};

/**
 * Hash a verification code for secure storage (SHA-256)
 * The schema stores verification_code_hash VARCHAR(255) UNIQUE
 */
const hashVerificationCode = (code) => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

/**
 * Generate a short numeric code for email/SMS verification
 */
const generateShortCode = (length = 6) => {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

module.exports = {
  generateVerificationCode,
  hashVerificationCode,
  generateShortCode
};