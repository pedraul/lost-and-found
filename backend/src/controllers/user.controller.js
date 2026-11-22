const User = require('../models/User');
const RegisteredItem = require('../models/RegisteredItem');
const FoundItem = require('../models/FoundItem');
const { AppError } = require('../middleware/error.middleware');
const { getSubscriptionSummary } = require('../services/subscription.service');

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        subscription: getSubscriptionSummary(user)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PATCH /api/users/me
 * @access  Private
 */
const updateMe = async (req, res, next) => {
  try {
    const allowedFields = ['full_name', 'phone', 'avatar_url', 'email'];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    if (req.file) {
      // Locally store a portable /uploads/ path (the frontend proxy resolves it on
      // desktop and phones); in production the file's Vercel Blob URL.
      updateData.avatar_url = req.file.url.startsWith('http') && !req.file.url.includes('/uploads/')
        ? req.file.url
        : `/uploads/${req.file.filename}`;
    }

    if (updateData.email) {
      updateData.email = updateData.email.trim().toLowerCase();
      const emailOwner = await User.findOne({ where: { email: updateData.email } });
      if (emailOwner && emailOwner.id !== req.user.id) {
        return next(new AppError('That email address is already in use.', 409));
      }
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await user.update(updateData);

    user.password_hash = undefined;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const deleteMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found', 404));
    await user.destroy();
    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's dashboard stats
 * @route   GET /api/users/dashboard
 * @access  Private
 */
const getDashboard = async (req, res, next) => {
  try {
    const [totalItems, activeItems, lostItems, stolenItems, returnedItems, foundReports] = await Promise.all([
      RegisteredItem.count({ where: { user_id: req.user.id } }),
      RegisteredItem.count({ where: { user_id: req.user.id, status: 'active' } }),
      RegisteredItem.count({ where: { user_id: req.user.id, status: 'lost' } }),
      RegisteredItem.count({ where: { user_id: req.user.id, status: 'stolen' } }),
      RegisteredItem.count({ where: { user_id: req.user.id, status: 'returned' } }),
      FoundItem.count({ where: { reporter_id: req.user.id } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalItems,
          activeItems,
          lostItems,
          stolenItems,
          returnedItems,
          foundReports
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID (admin only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  deleteMe,
  getDashboard,
  getUserById
};
