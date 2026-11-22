const AppError = require('../utils/appError');

const isSubscriptionActive = (user, now = new Date()) => {
  if (!user || user.subscription_status !== 'active' || !user.subscription_expires_at) {
    return false;
  }

  return new Date(user.subscription_expires_at).getTime() > now.getTime();
};

const isPaymentOverdue = (user, now = new Date()) => (
  Boolean(user?.payment_due_at)
  && !isSubscriptionActive(user, now)
  && new Date(user.payment_due_at).getTime() <= now.getTime()
);

const isWithinPaymentGracePeriod = (user, now = new Date()) => !isPaymentOverdue(user, now);

const requireActiveSubscription = (user) => {
  if (!isSubscriptionActive(user) && !isWithinPaymentGracePeriod(user)) {
    throw new AppError(
      'Your seven-day payment period has ended. Please complete payment before registering another item.',
      402
    );
  }
};

const getSubscriptionSummary = (user) => ({
  status: isSubscriptionActive(user) ? 'active' : user.subscription_status || 'inactive',
  expiresAt: user.subscription_expires_at || null,
  trialStartedAt: user.subscription_trial_started_at || null,
  paymentDueAt: user.payment_due_at || null,
  paymentOverdue: isPaymentOverdue(user),
  canRegisterItems: !isPaymentOverdue(user),
  canAccessDashboard: !isPaymentOverdue(user)
});

const startPaymentTrial = async (user) => {
  if (user.subscription_trial_started_at || user.payment_due_at) return;
  const startedAt = new Date();
  const dueAt = new Date(startedAt);
  dueAt.setDate(dueAt.getDate() + 7);
  await user.update({
    subscription_trial_started_at: startedAt,
    payment_due_at: dueAt,
    payment_reminder_sent_at: null
  });
};

const activateSubscription = async (user, durationMonths = 12, options = {}) => {
  const currentExpiry = user.subscription_expires_at
    ? new Date(user.subscription_expires_at)
    : null;
  const startDate = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
  const expiresAt = new Date(startDate);
  expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

  await user.update({
    subscription_status: 'active',
    subscription_expires_at: expiresAt,
    payment_due_at: null,
    payment_reminder_sent_at: null
  }, options);

  return getSubscriptionSummary(user);
};

module.exports = {
  isSubscriptionActive,
  isPaymentOverdue,
  isWithinPaymentGracePeriod,
  requireActiveSubscription,
  getSubscriptionSummary,
  startPaymentTrial,
  activateSubscription
};
