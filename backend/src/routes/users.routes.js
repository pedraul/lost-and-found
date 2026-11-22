const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All user routes are protected
router.use(protect);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', userController.getMe);

// @route   PATCH /api/users/me
// @desc    Update user profile
// @access  Private
router.patch('/me', userController.updateMe);

// @route   GET /api/users/dashboard
// @desc    Get user's dashboard stats
// @access  Private
router.get('/dashboard', userController.getDashboard);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', restrictTo('admin'), userController.getUserById);

module.exports = router;