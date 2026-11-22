const crypto = require('crypto');

const newKey = () => crypto.randomBytes(32).toString('base64');

const loadFresh = (env) => {
  jest.resetModules();
  process.env.PAYMENT_ENCRYPTION_KEY = env.key;
  process.env.PAYMENT_ENCRYPTION_PREVIOUS_KEYS = env.previous || '';
  return require('../src/utils/encryption');
};

describe('AES-256-GCM payment encryption', () => {
  const key = newKey();

  test('round-trips text and never stores the plaintext', () => {
    const enc = loadFresh({ key });
    const ciphertext = enc.encrypt('0781234567', 'payments.phone_number');
    expect(ciphertext.startsWith('enc:v1:')).toBe(true);
    expect(ciphertext).not.toContain('0781234567');
    expect(enc.decrypt(ciphertext, 'payments.phone_number')).toBe('0781234567');
  });

  test('uses a fresh IV so equal values give different ciphertexts', () => {
    const enc = loadFresh({ key });
    expect(enc.encrypt('same', 'f')).not.toBe(enc.encrypt('same', 'f'));
  });

  test('round-trips JSON payloads', () => {
    const enc = loadFresh({ key });
    const payload = { ref: 'abc-123', amount: 1000, status: 'pending', number: '0781234567' };
    const ciphertext = enc.encryptJson(payload, 'payments.provider_payload');
    expect(enc.decryptJson(ciphertext, 'payments.provider_payload')).toEqual(payload);
  });

  test('rejects tampered ciphertext', () => {
    const enc = loadFresh({ key });
    const parts = enc.encrypt('1000', 'f').split(':');
    const body = Buffer.from(parts[5], 'base64url');
    body[0] ^= 0xff;
    parts[5] = body.toString('base64url');
    expect(() => enc.decrypt(parts.join(':'), 'f')).toThrow();
  });

  test('rejects a value moved to a different field', () => {
    const enc = loadFresh({ key });
    const ciphertext = enc.encrypt('0781234567', 'payments.phone_number');
    expect(() => enc.decrypt(ciphertext, 'payments.provider_reference')).toThrow();
  });

  test('fails with the wrong key', () => {
    const ciphertext = loadFresh({ key }).encrypt('secret', 'f');
    expect(() => loadFresh({ key: newKey() }).decrypt(ciphertext, 'f')).toThrow(/No decryption key/);
  });

  test('passes legacy plaintext through unchanged', () => {
    const enc = loadFresh({ key });
    expect(enc.decrypt('0781234567', 'f')).toBe('0781234567');
    expect(enc.decryptJson({ ref: 'x' }, 'f')).toEqual({ ref: 'x' });
    expect(enc.decryptJson('{"ref":"x"}', 'f')).toEqual({ ref: 'x' });
  });

  test('key rotation: old ciphertext still decrypts and is flagged for re-encryption', () => {
    const oldCiphertext = loadFresh({ key }).encrypt('ref-1', 'f');
    const oldHash = require('../src/utils/encryption').lookupHash('ref-1');
    const rotated = loadFresh({ key: newKey(), previous: key });
    expect(rotated.decrypt(oldCiphertext, 'f')).toBe('ref-1');
    expect(rotated.needsReencryption(oldCiphertext)).toBe(true);
    expect(rotated.needsReencryption(rotated.encrypt('ref-1', 'f'))).toBe(false);
    expect(rotated.lookupHashCandidates('ref-1')).toContain(oldHash);
  });

  test('lookup hash is deterministic and does not reveal the value', () => {
    const enc = loadFresh({ key });
    expect(enc.lookupHash('ref-1')).toBe(enc.lookupHash('ref-1'));
    expect(enc.lookupHash('ref-1')).not.toBe(enc.lookupHash('ref-2'));
    expect(enc.lookupHash('ref-1')).toMatch(/^[0-9a-f]{64}$/);
  });

  test('refuses to run without a valid key', () => {
    expect(() => loadFresh({ key: '' }).assertEncryptionConfigured()).toThrow(/not configured/);
    expect(() => loadFresh({ key: 'too-short' }).assertEncryptionConfigured()).toThrow(/32-byte/);
  });
});

describe('Payment model', () => {
  test('encrypts sensitive fields in storage and decrypts on read', () => {
    loadFresh({ key: newKey() });
    const Payment = require('../src/models/Payment');
    const payment = Payment.build({
      user_id: crypto.randomUUID(),
      provider_reference: 'paypack-ref-42',
      idempotency_key: 'k'.repeat(32),
      amount: 1000,
      phone_number: '0781234567',
      provider_payload: { ref: 'paypack-ref-42', number: '0781234567' }
    });

    const stored = payment.get({ raw: true });
    for (const field of ['phone_number', 'provider_reference', 'provider_payload']) {
      expect(stored[field].startsWith('enc:v1:')).toBe(true);
      expect(stored[field]).not.toContain('0781234567');
    }
    expect(stored.provider_reference_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored.amount).toBe(1000);

    const json = payment.toJSON();
    expect(json.phone_number).toBe('0781234567');
    expect(json.provider_reference).toBe('paypack-ref-42');
    expect(json.provider_payload).toEqual({ ref: 'paypack-ref-42', number: '0781234567' });
  });
});
