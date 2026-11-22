const searchService = require('../services/search.service');

/**
 * @desc    Search items by identifier
 * @route   GET /api/search
 * @access  Public
 */
const searchByIdentifier = async (req, res, next) => {
  try {
    const query = req.query;
    const result = await searchService.searchItems(query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search found items by verification code
 * @route   GET /api/search/found-items
 * @access  Public
 */
const searchFoundItems = async (req, res, next) => {
  try {
    const { verification_code } = req.query;
    const result = await searchService.searchFoundItems(verification_code);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchByIdentifier,
  searchFoundItems
};