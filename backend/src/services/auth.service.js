const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const env = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { getSubscriptionSummary } = require('./subscription.service');

const sendPasswordResetEmail = async ({ to, resetToken }) => {
  if (!env.email.user || !env.email.appPassword) {
    throw new AppError('Password reset email is not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD.', 500);
  }

  const resetUrl = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.email.user,
      pass: env.email.appPassword
    }
  });

  await transporter.sendMail({
    from: env.email.from,
    to,
    subject: 'Reset your Lost & Found password',
    text: `You requested a password reset. Open this link to choose a new password: ${resetUrl}\n\nThis link expires in 10 minutes. If you did not request it, you can ignore this email.`,
    html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 10 minutes. If you did not request it, you can ignore this email.</p>`
  });
};

const signToken = (id) => {
  return jwt.sign({ id }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn
  });
};

const signRefreshToken = (id) => {
  return jwt.sign(
    { id, type: 'refresh' },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  user.password_hash = undefined;

  return res.status(statusCode).json({
    status: 'success',
    token,
    refreshToken,
    data: { user }
  });
};

const signup = async (reqBody) => {
  const { email, password, full_name, phone } = reqBody;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('User already exists with this email', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  const user = await User.create({
    email,
    password_hash: passwordHash,
    full_name,
    phone,
    verification_code: verificationCode,
    verification_code_expires: new Date(Date.now() + 10 * 60 * 1000),
    is_verified: true
  });

  const token = signToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      is_verified: user.is_verified,
      role: user.role,
      subscription: getSubscriptionSummary(user),
      created_at: user.created_at
    },
    accessToken: token,
    refreshToken
  };
};

const login = async (reqBody) => {
  const { email, password } = reqBody;

  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError('Invalid email or password', 401);
  }

  // Allow login without email verification - users can still access the app
  // Email verification can be enforced for specific features separately

  user.last_login = new Date();
  await user.save();

  const token = signToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      is_verified: user.is_verified,
      role: user.role,
      trust_score: user.trust_score,
      subscription: getSubscriptionSummary(user),
      created_at: user.created_at
    },
    accessToken: token,
    refreshToken
  };
};

const refreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  const decoded = await promisify(jwt.verify)(refreshToken, env.jwt.refreshSecret);

  if (decoded.type !== 'refresh') {
    throw new AppError('Invalid refresh token type', 401);
  }

  const user = await User.findByPk(decoded.id);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  const newAccessToken = signToken(user.id);
  const newRefreshToken = signRefreshToken(user.id);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return {
      status: 'success',
      message: 'If that email exists, a reset link has been sent'
    };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.password_reset_token = resetTokenHash;
  user.password_reset_expires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendPasswordResetEmail({ to: user.email, resetToken });

  return {
    status: 'success',
    message: 'Password reset instructions have been sent to your email.'
  };
};

const resetPassword = async (token, newPassword) => {
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    where: {
      password_reset_token: resetTokenHash,
      password_reset_expires: { [require('sequelize').Op.gt]: new Date() }
    }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password_hash = await bcrypt.hash(newPassword, 10);
  user.password_reset_token = null;
  user.password_reset_expires = null;
  await user.save();

  return {
    status: 'success',
    message: 'Password has been reset successfully'
  };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findByPk(userId);
  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
    throw new AppError('Current password is incorrect', 401);
  }
  user.password_hash = await bcrypt.hash(newPassword, 12);
  user.password_changed_at = new Date();
  await user.save();
  return { status: 'success', message: 'Password changed successfully' };
};

module.exports = {
  signup,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword
};
