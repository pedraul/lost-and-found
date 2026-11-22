const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminLogsController = require('../controllers/admin-logs.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All admin routes require authentication and admin role
router.use(protect, restrictTo('admin'));

// =====================
// ADMIN DASHBOARD ROUTES
// =====================

// Get overall dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

// Get recent activities across all users
router.get('/dashboard/activities', adminController.getRecentActivities);

// Full activity / audit log (payments, accounts, items, admin actions, security)
router.get('/logs', adminLogsController.getLogs);
router.get('/logs/actions', adminLogsController.getLogActions);
router.get('/logs/export', adminLogsController.exportLogs);

// Get registered items and found-item reports
router.get('/items', adminController.getItemsOverview);
router.get('/reports', adminController.getReportData);

// Get system metrics and trends
router.get('/dashboard/metrics', adminController.getSystemMetrics);

// =====================
// USER MANAGEMENT ROUTES
// =====================

// Get all users with their statistics
router.get('/users', adminController.getAllUsers);
router.get('/payments', adminController.getPayments);
router.patch('/payments/settings', adminController.updatePaymentSettings);
router.post('/users/:userId/subscription', adminController.activateUserSubscription);
router.patch('/users/:userId/status', adminController.updateUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

// Get detailed activity for a specific user
router.get('/users/:userId/activity', adminController.getUserActivity);

module.exports = router;
