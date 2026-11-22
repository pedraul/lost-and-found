const { Op } = require('sequelize');
const User = require('../models/User');
const RegisteredItem = require('../models/RegisteredItem');
const Match = require('../models/Match');

const getPublicStats = async (req, res, next) => {
  try {
    const [totalUsers, itemsTracked, totalMatches, recoveredMatches, confidenceResult] = await Promise.all([
      User.count(),
      RegisteredItem.count(),
      Match.count(),
      Match.count({ where: { status: 'confirmed' } }),
      Match.findOne({
        attributes: [[Match.sequelize.fn('AVG', Match.sequelize.col('confidence_score')), 'average']],
        where: { confidence_score: { [Op.gt]: 0 } },
        raw: true
      })
    ]);

    const recoveryRate = totalMatches ? Math.round((recoveredMatches / totalMatches) * 100) : 0;
    const confidenceScore = confidenceResult?.average
      ? Math.round(Number(confidenceResult.average) * 10) / 10
      : 0;

    res.status(200).json({
      success: true,
      data: { totalUsers, itemsTracked, recoveredRate: recoveryRate, confidenceScore }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPublicStats };