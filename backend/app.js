const express = require('express');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const env = require('./src/config/env');
const { notFound, errorHandler } = require('./src/middleware/error.middleware');
const paymentController = require('./src/controllers/payment.controller');
const { activityLogger } = require('./src/middleware/activity-log.middleware');
const { sendPaymentReminders } = require('./src/services/payment-reminder.service');
const { retryPendingPaymentConfirmations } = require('./src/services/payment-confirmation.service');

// Initialize all model associations before route handlers execute.
require('./src/models');

const app = express();

// Production deployments are normally behind one reverse proxy. Trust that
// proxy so rate limits use the visitor's IP rather than the proxy's shared IP.
app.set('trust proxy', 1);

// =====================
// GLOBAL MIDDLEWARE
// =====================

// Enable CORS
app.use(cors());

// Paypack signs the exact raw webhook body; this route must precede JSON parsing.
app.head('/api/payments/paypack/webhook', (req, res) => res.sendStatus(200));
app.post('/api/payments/paypack/webhook', express.raw({ type: 'application/json' }), paymentController.paypackWebhook);

// Scheduled jobs. On a normal server src/server.js runs these on timers; on
// Vercel (serverless, no timers) Vercel Cron calls these URLs instead — see
// backend/vercel.json. Vercel sends "Authorization: Bearer $CRON_SECRET".
const cronAuthorized = (req) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(req.get('authorization') || '');
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
};
const cronJob = (job) => async (req, res, next) => {
  if (!cronAuthorized(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const processed = await job();
    res.status(200).json({ success: true, processed });
  } catch (error) {
    next(error);
  }
};
app.get('/api/cron/payment-reminders', cronJob(sendPaymentReminders));
app.get('/api/cron/payment-confirmations', cronJob(retryPendingPaymentConfirmations));

// Security headers
app.use(helmet());

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Logging (HTTP)
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Keep read-heavy public pages usable without weakening protection for writes.
// Browsing a category loads both reports and catalogue data, so it should not
// share a small quota with login attempts, uploads, and other API mutations.
const publicReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== 'GET',
  message: {
    success: false,
    message: 'Too many browsing requests from this IP, please try again after 15 minutes'
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET',
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', publicReadLimiter);
app.use('/api', apiLimiter);

// Audit trail of user/admin actions for the admin Activity Logs page. Mounted
// after the rate limiters so a request flood cannot flood the log table too.
app.use('/api', activityLogger);

// Routes
const indexRoutes = require('./src/routes/index.routes');

// Health check
app.get('/health', (req, res) => res.status(200).json({ success: true, message: 'API is healthy' }));

// API Routes (all routes combined in index.routes.js)
app.use('/api', indexRoutes);

// 404 handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

module.exports = app;
