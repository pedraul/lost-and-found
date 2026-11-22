const env = require('../config/env');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { getSubscriptionSummary, activateSubscription } = require('../services/subscription.service');
const { createCashin, findTransaction, verifyWebhookSignature } = require('../services/paypack.service');
const { getAnnualAmount, getReceivingNumber } = require('../services/payment-settings.service');
const { sendPaymentConfirmation } = require('../services/payment-confirmation.service');
const AppError = require('../utils/appError');
const { recordActivity, systemActor, maskPhone } = require('../services/audit-log.service');

const formatRwf = (amount) => `${Number(amount).toLocaleString('en-RW')} RWF`;
const monthsLabel = (months) => `${months} ${months === 1 ? 'month' : 'months'}`;

const createCheckout = async (req, res, next) => {
  try {
    const annualAmount = await getAnnualAmount();
    const durationMonths = Number(req.body?.duration_months || 12);
    if (!Number.isInteger(durationMonths) || durationMonths < 1 || durationMonths > 12) {
      return next(new AppError('Choose a payment period from 1 to 12 months.', 400));
    }
    const amount = Math.ceil((annualAmount / 12) * durationMonths);
    if (env.paypack.paymentMode === 'mock') {
      res.locals.activity = {
        description: `Opened a test checkout: ${formatRwf(amount)} for ${monthsLabel(durationMonths)}`,
        metadata: { mode: 'mock', amount, currency: 'RWF', duration_months: durationMonths }
      };
      return res.status(200).json({ success: true, data: { mode: 'mock', annualAmount, amount, durationMonths } });
    }

    const enteredPhoneNumber = String(req.body?.phone_number || req.user.phone || '').trim();
    const compactPhoneNumber = enteredPhoneNumber.replace(/[\s()-]/g, '');
    let phoneNumber;

    if (/^07\d{8}$/.test(compactPhoneNumber)) {
      phoneNumber = compactPhoneNumber;
    } else if (/^\+?2507\d{8}$/.test(compactPhoneNumber)) {
      phoneNumber = `0${compactPhoneNumber.replace(/^\+?250/, '')}`;
    } else {
      return next(new AppError('Enter a valid Rwanda mobile-money number, for example 0781234567.', 400));
    }

    const existingPayment = await Payment.findOne({
      where: { user_id: req.user.id, status: 'pending' },
      order: [['created_at', 'DESC']]
    });
    if (existingPayment) {
      res.locals.activity = {
        resourceId: existingPayment.id,
        description: `Reopened a pending payment of ${formatRwf(existingPayment.amount)} for ${monthsLabel(existingPayment.duration_months || 12)}`,
        metadata: {
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          duration_months: existingPayment.duration_months,
          phone: maskPhone(existingPayment.phone_number),
          provider_reference: existingPayment.provider_reference,
          reused_pending_payment: true
        }
      };
      return res.status(200).json({ success: true, data: {
        payment: existingPayment,
        annualAmount,
        amount: existingPayment.amount,
        durationMonths: existingPayment.duration_months,
        mode: 'paypack'
      } });
    }

    const idempotencyKey = crypto.randomBytes(16).toString('hex');
    const providerPayment = await createCashin({
      amount,
      number: phoneNumber,
      idempotencyKey
    });
    if (!providerPayment?.ref) {
      throw new AppError('Paypack did not return a transaction reference. Please try again.', 502);
    }
    const payment = await Payment.create({
      user_id: req.user.id,
      provider_reference: providerPayment.ref,
      idempotency_key: idempotencyKey,
      amount,
      duration_months: durationMonths,
      phone_number: phoneNumber,
      status: providerPayment.status || 'pending',
      provider_payload: providerPayment
    });

    res.locals.activity = {
      resourceId: payment.id,
      description: `Started a payment of ${formatRwf(amount)} for ${monthsLabel(durationMonths)} via Paypack`,
      metadata: {
        amount,
        currency: payment.currency,
        duration_months: durationMonths,
        phone: maskPhone(phoneNumber),
        provider: 'paypack',
        provider_reference: providerPayment.ref,
        provider_status: providerPayment.status || 'pending'
      }
    };
    res.status(200).json({ success: true, data: {
      payment,
      annualAmount,
      amount,
      durationMonths,
      mode: 'paypack'
    } });
  } catch (error) {
    next(error);
  }
};

const completeMockPayment = async (req, res, next) => {
  try {
    if (env.paypack.paymentMode !== 'mock') {
      return next(new AppError('Test payments are disabled.', 403));
    }
    const durationMonths = Number(req.body?.duration_months || 12);
    if (!Number.isInteger(durationMonths) || durationMonths < 1 || durationMonths > 12) {
      return next(new AppError('Choose a payment period from 1 to 12 months.', 400));
    }
    const subscription = await activateSubscription(req.user, durationMonths);
    res.locals.activity = {
      description: `Completed a test payment for ${monthsLabel(durationMonths)}`,
      metadata: { mode: 'mock', duration_months: durationMonths, subscription_expires_at: req.user.subscription_expires_at }
    };
    res.status(200).json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

// source: 'webhook' (Paypack called us) or 'status_check' (the user's page polled Paypack).
const applyPaymentStatus = async (payment, providerPayload, { source = 'status_check', req } = {}) => {
  const providerStatus = String(providerPayload?.status || '').toLowerCase();
  if (!['successful', 'failed', 'pending'].includes(providerStatus)) return payment;

  let previousStatus;
  const updatedPayment = await Payment.sequelize.transaction(async (transaction) => {
    const lockedPayment = await Payment.findByPk(payment.id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (!lockedPayment) return null;
    previousStatus = lockedPayment.status;

    // A successful payment is terminal. Concurrent webhook and polling updates
    // must not extend a user's subscription twice.
    if (lockedPayment.status === 'successful') return lockedPayment;

    const processedAt = providerStatus === 'pending' ? null : new Date();
    if (providerStatus === 'successful') {
      const user = await User.findByPk(lockedPayment.user_id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!user) throw new AppError('The account for this payment no longer exists.', 404);
      await activateSubscription(user, lockedPayment.duration_months || 12, { transaction });
    }

    await lockedPayment.update({
      status: providerStatus,
      provider_payload: providerPayload,
      processed_at: processedAt
    }, { transaction });
    return lockedPayment;
  });

  // Log only real transitions, not every poll that still says "pending".
  if (updatedPayment && previousStatus !== updatedPayment.status) {
    const succeeded = updatedPayment.status === 'successful';
    const failed = updatedPayment.status === 'failed';
    const owner = await User.findByPk(updatedPayment.user_id, { attributes: ['id', 'email', 'full_name'] });
    await recordActivity({
      action: succeeded ? 'payment_successful' : failed ? 'payment_failed' : 'payment_status_changed',
      category: 'payment',
      resource: 'payment',
      resourceId: updatedPayment.id,
      actor: systemActor(source === 'webhook' ? 'Paypack webhook' : 'Paypack status check'),
      subjectUserId: updatedPayment.user_id,
      outcome: failed ? 'failure' : 'success',
      description: succeeded
        ? `Payment of ${formatRwf(updatedPayment.amount)} confirmed for ${owner?.full_name || owner?.email || 'a user'}; subscription extended by ${monthsLabel(updatedPayment.duration_months || 12)}`
        : failed
          ? `Payment of ${formatRwf(updatedPayment.amount)} failed for ${owner?.full_name || owner?.email || 'a user'}`
          : `Payment status changed from ${previousStatus} to ${updatedPayment.status}`,
      metadata: {
        source,
        previous_status: previousStatus,
        status: updatedPayment.status,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        duration_months: updatedPayment.duration_months,
        provider_reference: updatedPayment.provider_reference,
        phone: maskPhone(updatedPayment.phone_number),
        user_email: owner?.email
      },
      req: source === 'webhook' ? req : undefined
    });
  }

  if (updatedPayment?.status === 'successful') {
    await sendPaymentConfirmation(updatedPayment.id);
  }
  return updatedPayment;
};

const getStatus = async (req, res, next) => {
  try {
    let payment = await Payment.findOne({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    if (payment && payment.status === 'pending') {
      const providerPayment = await findTransaction(payment.provider_reference);
      payment = await applyPaymentStatus(payment, providerPayment, { source: 'status_check' });
    }
    if (payment?.status === 'successful') await sendPaymentConfirmation(payment.id);
    const user = await req.user.reload();
    res.status(200).json({
      success: true,
      data: { payment, annualAmount: await getAnnualAmount(), monthlyAmount: Math.ceil((await getAnnualAmount()) / 12), receivingNumber: await getReceivingNumber(), subscription: getSubscriptionSummary(user) }
    });
  } catch (error) {
    next(error);
  }
};

const paypackWebhook = async (req, res, next) => {
  try {
    const signature = req.get('X-Paypack-Signature');
    if (!verifyWebhookSignature(req.body, signature)) {
      await recordActivity({
        action: 'payment_webhook_rejected',
        category: 'security',
        resource: 'payment',
        outcome: 'failure',
        actor: systemActor('Paypack webhook'),
        description: 'Rejected a payment webhook with a missing or invalid signature',
        metadata: { signature_present: Boolean(signature) },
        req,
        statusCode: 401
      });
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }
    const payload = JSON.parse(req.body.toString('utf8'));
    if (payload.kind !== 'transaction:processed' || !payload.data?.ref) {
      return res.status(200).json({ success: true });
    }
    const payment = await Payment.findByProviderReference(payload.data.ref);
    if (!payment) {
      await recordActivity({
        action: 'payment_webhook_unmatched',
        category: 'payment',
        resource: 'payment',
        outcome: 'failure',
        actor: systemActor('Paypack webhook'),
        description: 'Received a signed Paypack webhook for an unknown transaction reference',
        metadata: { provider_reference: payload.data.ref, status: payload.data.status, amount: payload.data.amount },
        req,
        statusCode: 200
      });
    } else if (payment.status !== 'successful') {
      await applyPaymentStatus(payment, payload.data, { source: 'webhook', req });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCheckout, completeMockPayment, getStatus, paypackWebhook };
