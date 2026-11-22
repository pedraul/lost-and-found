const { requireActiveSubscription } = require('../services/subscription.service');

const requireSubscription = (req, res, next) => {
  try {
    requireActiveSubscription(req.user);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireSubscription };
