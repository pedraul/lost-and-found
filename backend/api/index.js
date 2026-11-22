// Vercel serverless entry point: every request is routed here (see ../vercel.json)
// and handled by the same Express app that src/server.js runs locally.
const env = require('../src/config/env');
const { assertEncryptionConfigured } = require('../src/utils/encryption');

// Payment data is stored encrypted; fail loudly in the logs if the key is missing.
if (env.paypack.paymentMode !== 'mock') assertEncryptionConfigured();

module.exports = require('../app');
