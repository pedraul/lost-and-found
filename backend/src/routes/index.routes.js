const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const itemController = require('../controllers/item.controller');
const foundItemController = require('../controllers/found-item.controller');
const searchController = require('../controllers/search.controller');
const matchController = require('../controllers/match.controller');
const verificationController = require('../controllers/verification.controller');
const reportController = require('../controllers/report.controller');
const paymentController = require('../controllers/payment.controller');
const publicController = require('../controllers/public.controller');
const adminRoutes = require('./admin.routes');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

// =====================
// AUTH ROUTES
// =====================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh-token', authController.refreshToken);
router.post('/auth/logout', authController.logout);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/change-password', protect, authController.changePassword);

// PUBLIC AGGREGATES
router.get('/public/stats', publicController.getPublicStats);

// =====================
// USER ROUTES
// =====================
router.get('/users/me', protect, userController.getMe);
router.patch('/users/me', protect, upload.single('avatar'), userController.updateMe);
router.delete('/users/me', protect, userController.deleteMe);
router.get('/users/dashboard', protect, userController.getDashboard);
router.get('/users/:id', protect, userController.getUserById);

// PAYMENT ROUTES
router.post('/payments/checkout', protect, paymentController.createCheckout);
router.post('/payments/mock/complete', protect, paymentController.completeMockPayment);
router.get('/payments/status', protect, paymentController.getStatus);

// =====================
// ITEM ROUTES
// =====================
router.get('/lost-items', itemController.getPublicLostItems);
router.post('/items', protect, upload.fields([
	{ name: 'receipt_image', maxCount: 1 },
	{ name: 'device_image', maxCount: 1 }
]), itemController.registerItem);
router.get('/items', protect, itemController.getMyItems);
router.get('/items/search/:identifierType/:identifier', itemController.searchByIdentifier);
router.get('/items/device-types', itemController.getDeviceTypes);
router.get('/items/device-types/:id/manufacturers', itemController.getManufacturersByDeviceType);
router.get('/items/:id', protect, itemController.getItemById);
router.patch('/items/:id', protect, itemController.updateItem);
router.delete('/items/:id', protect, itemController.deleteItem);

// =====================
// FOUND ITEM ROUTES
// =====================
router.post('/found-items', upload.fields([
	{ name: 'overall_image', maxCount: 1 },
	{ name: 'serial_image', maxCount: 1 }
]), foundItemController.reportFoundItem);
router.get('/found-items', foundItemController.getFoundItems);
router.get('/found-items/:id', foundItemController.getFoundItemById);
router.post('/found-items/:id/match', protect, foundItemController.matchFoundItem);
router.post('/found-items/:id/claim', protect, foundItemController.claimFoundItem);

// =====================
// SEARCH ROUTES
// =====================
router.get('/search', searchController.searchByIdentifier);
router.get('/search/found', searchController.searchFoundItems);
router.get('/search/found-items', searchController.searchFoundItems);

// =====================
// MATCH ROUTES
// =====================
router.get('/matches', protect, matchController.getMyMatches);
router.patch('/matches/:id', protect, matchController.updateMatchStatus);

// =====================
// VERIFICATION ROUTES
// =====================
router.post('/verifications/:itemId', protect, verificationController.createVerification);
router.post('/verifications/verify-code', verificationController.verifyWithCode);
router.get('/verifications/:id', protect, verificationController.getVerificationStatus);

// =====================
// REPORT ROUTES
// =====================
router.get('/reports/:itemId', protect, reportController.generateItemReport);

// =====================
// ADMIN ROUTES
// =====================
router.use('/admin', adminRoutes);

module.exports = router;