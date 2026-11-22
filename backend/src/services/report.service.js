const { Op } = require('sequelize');
const RegisteredItem = require('../models/RegisteredItem');
const FoundItem = require('../models/FoundItem');
const DeviceType = require('../models/DeviceType');
const Manufacturer = require('../models/Manufacturer');
const StatusChangeLog = require('../models/StatusChangeLog');
const AppError = require('../utils/appError');

/**
 * REPORT SERVICE
 * Generates reports for items (ownership status, found history, status history)
 */
const generateItemReport = async (itemId, reportType) => {
  const item = await RegisteredItem.findByPk(itemId, {
    include: [
      { model: DeviceType, as: 'deviceType', attributes: ['id', 'name', 'display_name', 'icon'] },
      { model: Manufacturer, as: 'manufacturer', attributes: ['id', 'name', 'display_name'] }
    ]
  });

  if (!item) {
    throw new AppError('Registered item not found', 404);
  }

  const report = {
    generated_at: new Date(),
    item
  };

  switch (reportType) {
    case 'status_history': {
      // Get all status changes for this item
      const statusLogs = await StatusChangeLog.findAll({
        where: { item_id: itemId },
        order: [['created_at', 'DESC']]
      });

      report.status_history = statusLogs.map(log => ({
        from: log.previous_status,
        to: log.new_status,
        changed_by: log.changed_by,
        reason: log.reason,
        metadata: log.metadata,
        created_at: log.created_at
      }));
      break;
    }

    case 'found_history': {
      // Get all found items matched to this registered item
      const foundItems = await FoundItem.findAll({
        where: { matched_item_id: itemId },
        order: [['created_at', 'DESC']]
      });

      report.found_history = foundItems.map(fi => ({
        id: fi.id,
        status: fi.status,
        found_location: fi.found_location,
        found_date: fi.found_date,
        matched_at: fi.matched_at,
        confidence_score: fi.match_confidence_score
      }));
      break;
    }

    case 'full':
      // Combine all report types
      const [statusLogs, foundItems] = await Promise.all([
        StatusChangeLog.findAll({
          where: { item_id: itemId },
          order: [['created_at', 'DESC']]
        }),
        FoundItem.findAll({
          where: { matched_item_id: itemId },
          order: [['created_at', 'DESC']]
        })
      ]);

      report.status_history = statusLogs.map(log => ({
        from: log.previous_status,
        to: log.new_status,
        changed_by: log.changed_by,
        reason: log.reason,
        created_at: log.created_at
      }));

      report.found_history = foundItems.map(fi => ({
        id: fi.id,
        status: fi.status,
        found_location: fi.found_location,
        found_date: fi.found_date,
        matched_at: fi.matched_at,
        confidence_score: fi.match_confidence_score
      }));
      break;

    default:
      throw new AppError(`Unsupported report type: ${reportType}. Use 'status_history', 'found_history', or 'full'`, 400);
  }

  return report;
};

module.exports = { generateItemReport };