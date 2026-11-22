const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const { protect } = require('../middleware/auth.middleware');

// All match routes are protected
router.use(protect);

// @route   GET /api/matches
// @desc    Get all matches for a user
// @access  Private
router.get('/', matchController.getMyMatches);

// @route   PATCH /api/matches/:id
// @desc    Update match status (accept/reject)
// @access  Private
router.patch('/:id', matchController.updateMatchStatus);

module.exports = router;