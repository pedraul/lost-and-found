const crypto = require('crypto');
const env = require('../config/env');
const AppError = require('../utils/appError');

let accessToken;
let accessTokenExpiresAt = 0;

const paypackRequest = async (path, options = {}) => {
  const response = await fetch(`${env.paypack.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AppError(data.message || 'Paypack request failed', 502);
  }
  return data;
};

const authenticate = async () => {
  if (!env.paypack.clientId || !env.paypack.clientSecret) {
    throw new AppError('Paypack credentials are not configured.', 503);
  }
  if (!env.paypack.webhookSecret) {
    throw new AppError('Paypack webhook is not configured.', 503);
  }
  if (accessToken && Date.now() < accessTokenExpiresAt) return accessToken;

  const data = await paypackRequest('/auth/agents/authorize', {
    method: 'POST',
    body: JSON.stringify({
      client_id: env.paypack.clientId,
      client_secret: env.paypack.clientSecret
    })
  });
  accessToken = data.access;
  accessTokenExpiresAt = Date.now() + 10 * 60 * 1000;
  return accessToken;
};

const createCashin = async ({ amount, number, idempotencyKey }) => {
  await authenticate();
  return paypackRequest('/transactions/cashin', {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey,
      'X-Webhook-Mode': env.paypack.webhookMode
    },
    body: JSON.stringify({ amount, number })
  });
};

const findTransaction = async (reference) => {
  await authenticate();
  return paypackRequest(`/transactions/find/${encodeURIComponent(reference)}`);
};

const verifyWebhookSignature = (rawBody, signature) => {
  if (!env.paypack.webhookSecret || !signature) return false;
  const expected = crypto
    .createHmac('sha256', env.paypack.webhookSecret)
    .update(rawBody)
    .digest('base64');
  const received = Buffer.from(signature, 'utf8');
  const calculated = Buffer.from(expected, 'utf8');
  return received.length === calculated.length && crypto.timingSafeEqual(received, calculated);
};

module.exports = { createCashin, findTransaction, verifyWebhookSignature };
