const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const env = require('../config/env');
const User = require('../models/User');
const { AppError } = require('./error.middleware');

const protect = async (req, res, next) => {
  try {
    // 1) Get token from headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, env.jwt.secret);

    // 3) Find user by id
    const currentUser = await User.findByPk(decoded.id);

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if user changed password after token issued
    if (currentUser.password_changed_at) {
      const passwordChangedTimestamp = parseInt(currentUser.password_changed_at.getTime() / 1000, 10);
      if (passwordChangedTimestamp > decoded.iat) {
        return next(new AppError('User recently changed password. Please log in again.', 401));
      }
    }

    // 5) Grant access
    req.user = currentUser;
    if (currentUser.account_status !== 'active' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next(new AppError('This account is read-only. Contact an administrator to reactivate it.', 403));
    }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    return next(error);
  }
};

// Restrict access to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };