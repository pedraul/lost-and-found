const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const env = require('../config/env');
const logger = require('../utils/logger');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { recordActivity, systemActor } = require('./audit-log.service');

const emailIsConfigured = () => Boolean(env.email.user && env.email.appPassword);

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]));

const deliverConfirmation = async (payment, user) => {
  if (!emailIsConfigured()) throw new Error('Payment confirmation email is not configured.');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: env.email.user, pass: env.email.appPassword }
  });
  const paidAt = payment.processed_at || new Date();
  const expiry = user.subscription_expires_at
    ? new Date(user.subscription_expires_at).toLocaleDateString('en-RW', { dateStyle: 'long' })
    : 'Not available';
  const months = payment.duration_months || 12;
  const period = `${months} ${months === 1 ? 'month' : 'months'}`;
  const reference = payment.provider_reference;
  const amount = `${Number(payment.amount).toLocaleString('en-RW')} ${payment.currency || 'RWF'}`;
  const name = user.full_name || 'there';

  await transporter.sendMail({
    from: env.email.from,
    to: user.email,
    subject: 'Payment confirmed - Lost & Found Rwanda',
    text: [
      `Hello ${name},`,
      '',
      'Your payment has been confirmed. Your item registration subscription is active.',
      `Amount paid: ${amount}`,
      `Subscription period: ${period}`,
      `Subscription valid until: ${expiry}`,
      `Paypack reference: ${reference}`,
      `Payment date: ${paidAt.toISOString()}`,
      '',
      'Thank you for using Lost & Found Rwanda.'
    ].join('\n'),
    html: `
      <div style="margin:0;background:#f4f6f8;padding:32px 16px;font-family:Arial,sans-serif;color:#172033">
        <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:32px">
          <p style="margin:0 0 8px;color:#e85d3f;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Payment confirmed</p>
          <h1 style="margin:0 0 16px;font-size:24px">Thank you, ${escapeHtml(name)}</h1>
          <p style="margin:0 0 24px;line-height:1.6">Your payment has been confirmed and your item registration subscription is active.</p>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;color:#64748b">Amount paid</td><td style="padding:10px 0;text-align:right;font-weight:700">${escapeHtml(amount)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b">Subscription period</td><td style="padding:10px 0;text-align:right;font-weight:700">${escapeHtml(period)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b">Valid until</td><td style="padding:10px 0;text-align:right;font-weight:700">${escapeHtml(expiry)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b">Paypack reference</td><td style="padding:10px 0;text-align:right;font-family:monospace">${escapeHtml(reference)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b">Payment date</td><td style="padding:10px 0;text-align:right">${escapeHtml(paidAt.toLocaleString('en-RW'))}</td></tr>
          </table>
          <p style="margin:24px 0 0;color:#64748b;font-size:13px">Thank you for using Lost &amp; Found Rwanda.</p>
        </div>
      </div>`
  });
};

const sendPaymentConfirmation = async (paymentId) => {
  if (!emailIsConfigured()) {
    logger.error('Payment confirmation email could not be sent because email credentials are not configured.');
    return false;
  }

  try {
    return await Payment.sequelize.transaction(async (transaction) => {
      const payment = await Payment.findByPk(paymentId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!payment || payment.status !== 'successful' || payment.confirmation_email_sent_at) return false;

      const user = await User.findByPk(payment.user_id, { transaction });
      if (!user?.email) throw new Error('The account has no email address for the payment confirmation.');

      // Keep this row locked until SMTP accepts the message so simultaneous
      // webhook, polling, and retry-worker calls cannot send duplicate receipts.
      await deliverConfirmation(payment, user);
      await payment.update({ confirmation_email_sent_at: new Date() }, { transaction });
      return { payment, user };
    }).then(async (sent) => {
      if (!sent) return false;
      await recordActivity({
        action: 'payment_receipt_emailed',
        category: 'payment',
        resource: 'payment',
        resourceId: sent.payment.id,
        actor: systemActor('Email service'),
        subjectUserId: sent.user.id,
        description: `Emailed a payment receipt to ${sent.user.email}`,
        metadata: { amount: sent.payment.amount, currency: sent.payment.currency, provider_reference: sent.payment.provider_reference }
      });
      return true;
    });
  } catch (error) {
    logger.error(`Payment confirmation email failed for payment ${paymentId}: ${error.message}`);
    return false;
  }
};

const retryPendingPaymentConfirmations = async () => {
  if (!emailIsConfigured()) return 0;

  const pending = await Payment.findAll({
    where: {
      status: 'successful',
      confirmation_email_sent_at: { [Op.is]: null }
    },
    attributes: ['id'],
    order: [['created_at', 'ASC']],
    limit: 50
  });

  let sent = 0;
  for (const payment of pending) {
    if (await sendPaymentConfirmation(payment.id)) sent += 1;
  }
  return sent;
};

module.exports = { sendPaymentConfirmation, retryPendingPaymentConfirmations };
