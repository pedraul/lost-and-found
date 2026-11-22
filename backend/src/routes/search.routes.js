const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// @route   GET /api/search
// @desc    Search items by identifier (public)
// @access  Public
router.get('/', searchController.searchByIdentifier);

// @route   GET /api/search/found-items
// @desc    Search found items (public)
// @access  Public
router.get('/found-items', searchController.searchFoundItems);

module.exports = router;