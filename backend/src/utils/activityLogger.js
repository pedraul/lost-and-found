/**
 * Activity Logging Helper
 * 
 * Use this utility to log user activities throughout the application.
 * 
 * Example:
 * const { logActivity } = require('../utils/activityLogger');
 * 
 * await logActivity(req, {
 *   action: 'item_registered',
 *   resource: 'registered_item',
 *   resourceId: item.id,
 *   description: 'User registered a new iPhone 13',
 *   metadata: { deviceType: 'iPhone', model: '13' }
 * });
 */

const { recordActivity } = require('../services/audit-log.service');

/**
 * Log a user activity
 * @param {Object} req - Express request object (for IP and user-agent)
 * @param {Object} options - Logging options
 * @param {string} options.action - Action type (e.g., 'item_registered')
 * @param {string} options.resource - Resource type (e.g., 'registered_item')
 * @param {UUID} options.resourceId - ID of the resource being acted upon
 * @param {string} options.description - Human-readable description
 * @param {Object} options.metadata - Additional metadata
 * @returns {Promise<ActivityLog>}
 */
async function logActivity(req, options) {
  try {
    const {
      action,
      resource,
      resourceId,
      description,
      metadata = {}
    } = options;

    // Validate required fields
    if (!action || !resource || !req.user) {
      console.warn('logActivity: Missing required fields');
      return null;
    }

    // Most actions are already logged automatically by
    // middleware/activity-log.middleware.js; use this for extra events.
    return await recordActivity({
      action,
      category: options.category || 'other',
      resource,
      resourceId,
      description,
      metadata,
      actor: req.user,
      req
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging failures shouldn't break the app
    return null;
  }
}

/**
 * Common activity action types
 */
const ActivityTypes = {
  // Item activities
  ITEM_REGISTERED: 'item_registered',
  ITEM_FOUND: 'item_found',
  ITEM_CLAIMED: 'item_claimed',
  ITEM_RETURNED: 'item_returned',
  ITEM_DELETED: 'item_deleted',

  // Match activities
  MATCH_CREATED: 'match_created',
  MATCH_ACCEPTED: 'match_accepted',
  MATCH_REJECTED: 'match_rejected',
  MATCH_COMPLETED: 'match_completed',

  // Verification activities
  VERIFICATION_INITIATED: 'verification_initiated',
  VERIFICATION_COMPLETED: 'verification_completed',
  VERIFICATION_FAILED: 'verification_failed',

  // Status changes
  STATUS_CHANGED: 'status_changed',

  // User activities
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_PROFILE_UPDATED: 'user_profile_updated',
  USER_PASSWORD_CHANGED: 'user_password_changed',

  // Report activities
  REPORT_GENERATED: 'report_generated',
  REPORT_SUBMITTED: 'report_submitted'
};

/**
 * Resource types
 */
const ResourceTypes = {
  REGISTERED_ITEM: 'registered_item',
  FOUND_ITEM: 'found_item',
  MATCH: 'match',
  VERIFICATION: 'verification',
  USER: 'user',
  REPORT: 'report'
};

module.exports = {
  logActivity,
  ActivityTypes,
  ResourceTypes
};
