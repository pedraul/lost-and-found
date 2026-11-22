const reportService = require('../services/report.service');

/**
 * @desc    Generate a report for an item
 * @route   GET /api/reports/:itemId
 * @access  Private
 */
const generateItemReport = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { reportType = 'full' } = req.query;

    const result = await reportService.generateItemReport(itemId, reportType);

    res.status(200).json({
      success: true,
      message: 'Report generated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateItemReport
};