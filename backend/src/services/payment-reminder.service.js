const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const env = require('../config/env');
const User = require('../models/User');
const { recordActivity, systemActor } = require('./audit-log.service');

const sendPaymentReminders = async () => {
  if (!env.email.user || !env.email.appPassword) return 0;

  const users = await User.findAll({
    where: {
      payment_due_at: { [Op.lte]: new Date() },
      payment_reminder_sent_at: null,
      [Op.or]: [
        { subscription_status: { [Op.ne]: 'active' } },
        { subscription_status: 'active', subscription_expires_at: { [Op.lte]: new Date() } }
      ]
    }
  });
  if (!users.length) return 0;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: env.email.user, pass: env.email.appPassword }
  });

  for (const user of users) {
    const paymentUrl = `${env.frontendUrl}/dashboard/payment`;
    await transporter.sendMail({
      from: env.email.from,
      to: user.email,
      subject: 'Payment reminder for your Lost & Found items',
      text: `Hello ${user.full_name}, your seven-day payment period has ended. Please complete your payment to keep accessing your dashboard and registering items: ${paymentUrl}`,
      html: `<p>Hello ${user.full_name},</p><p>Your seven-day payment period has ended. Please complete your payment to keep accessing your dashboard and registering items.</p><p><a href="${paymentUrl}">Complete payment</a></p>`
    });
    await user.update({ payment_reminder_sent_at: new Date(), subscription_status: 'past_due' });
    await recordActivity({
      action: 'payment_reminder_sent',
      category: 'payment',
      resource: 'user',
      resourceId: user.id,
      actor: systemActor('Payment reminder job'),
      subjectUserId: user.id,
      description: `Sent an overdue-payment reminder to ${user.email}; subscription marked past due`,
      metadata: { payment_due_at: user.payment_due_at }
    });
  }

  return users.length;
};

module.exports = { sendPaymentReminders };