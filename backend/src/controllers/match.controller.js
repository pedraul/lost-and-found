const matchService = require('../services/matching.service');

/**
 * @desc    Get all matches for a user
 * @route   GET /api/matches
 * @access  Private
 */
const getMyMatches = async (req, res, next) => {
  try {
    const result = await matchService.getMatchesForUser(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update match status (accept/reject)
 * @route   PATCH /api/matches/:id
 * @access  Private
 */
const updateMatchStatus = async (req, res, next) => {
  try {
    const match = await matchService.updateMatchStatus(
      req.params.id,
      req.body.status,
      req.user.id,
      req.body.reason
    );
    res.status(200).json({
      success: true,
      message: 'Match status updated successfully',
      data: { match }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyMatches,
  updateMatchStatus
};