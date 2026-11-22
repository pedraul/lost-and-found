const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('../models/User');
const RegisteredItem = require('../models/RegisteredItem');
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const VerificationLog = require('../models/VerificationLog');
const StatusChangeLog = require('../models/StatusChangeLog');
const ActivityLog = require('../models/ActivityLog');
const Payment = require('../models/Payment');
const { activateSubscription } = require('../services/subscription.service');
const { getAnnualAmount, setAnnualAmount, getReceivingNumber, setReceivingNumber } = require('../services/payment-settings.service');
const { AppError } = require('../middleware/error.middleware');
const { recordActivity } = require('../services/audit-log.service');

// =====================
// GET OVERALL STATISTICS
// =====================
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalItems,
      totalFoundItems,
      totalMatches,
      totalVerifications,
      activeUsers,
      verifiedUsers,
      itemsLastWeek,
      matchesLastWeek
    ] = await Promise.all([
      User.count(),
      RegisteredItem.count(),
      FoundItem.count(),
      Match.count(),
      VerificationLog.count({ distinct: true, col: 'item_id' }),
      User.count({ where: { created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      User.count({ where: { is_verified: true } }),
      RegisteredItem.count({ where: { created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      Match.count({ where: { created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
    ]);

    const itemsByStatus = await RegisteredItem.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const matchSuccessRate = await Match.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalItems,
        totalFoundItems,
        totalMatches,
        totalVerifications,
        activeUsersThisWeek: activeUsers,
        verifiedUsers,
        itemsRegisteredThisWeek: itemsLastWeek,
        matchesCreatedThisWeek: matchesLastWeek,
        itemsByStatus,
        matchSuccessRate
      }
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// GET RECENT ACTIVITIES
// =====================
exports.getRecentActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const activities = await ActivityLog.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'avatar_url']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    const total = await ActivityLog.count();

    res.status(200).json({
      status: 'success',
      data: {
        activities,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// GET REGISTERED AND FOUND ITEMS
// =====================
exports.getItemsOverview = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const [registeredItems, foundItems] = await Promise.all([
      RegisteredItem.findAll({
        attributes: ['id', 'user_id', 'item_name', 'model', 'status', 'is_verified', 'created_at'],
        order: [['created_at', 'DESC']],
        limit
      }),
      FoundItem.findAll({
        attributes: ['id', 'reporter_id', 'item_name', 'item_category', 'status', 'found_location', 'found_date', 'created_at'],
        order: [['created_at', 'DESC']],
        limit
      })
    ]);

    const ownerIds = registeredItems.map(item => item.user_id).filter(Boolean);
    const reporterIds = foundItems.map(item => item.reporter_id).filter(Boolean);
    const users = await User.findAll({
      where: { id: { [Op.in]: [...new Set([...ownerIds, ...reporterIds])] } },
      attributes: ['id', 'full_name', 'email']
    });
    const usersById = new Map(users.map(user => [user.id, user.toJSON()]));

    const registeredItemsWithOwners = registeredItems.map(item => ({
      ...item.toJSON(),
      owner: usersById.get(item.user_id) || null
    }));
    const foundItemsWithReporters = foundItems.map(item => ({
      ...item.toJSON(),
      reporter: usersById.get(item.reporter_id) || null
    }));

    res.status(200).json({
      status: 'success',
      data: { registeredItems: registeredItemsWithOwners, foundItems: foundItemsWithReporters }
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// GET FULL DATABASE REPORT DATA
// =====================
exports.getReportData = async (req, res, next) => {
  try {
    const source = req.query.source || 'registered';
    const order = [['created_at', 'DESC']];
    let records;

    if (source === 'users') records = await User.findAll({ attributes: { exclude: ['password_hash', 'password_changed_at'] }, order });
    else if (source === 'registered') records = await RegisteredItem.findAll({ include: [{ model: User, as: 'owner', attributes: ['full_name', 'email'] }], order });
    else if (source === 'found') records = await FoundItem.findAll({ include: [{ model: User, as: 'reporter', attributes: ['full_name', 'email'] }], order });
    else if (source === 'payments') records = await Payment.findAll({ include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }], order });
    else if (source === 'activity') records = await ActivityLog.findAll({ include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }], order });
    else return next(new AppError('Unsupported report source', 400));

    res.status(200).json({ status: 'success', data: { records: records.map((record) => record.toJSON()) } });
  } catch (error) {
    next(error);
  }
};

// =====================
// GET ALL USERS WITH STATS
// =====================
exports.getAllUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const role = req.query.role;

    let where = {};
    if (role) {
      where.role = role;
    }

    const users = await User.findAll({
      attributes: {
        exclude: ['password_hash', 'password_changed_at']
      },
      where,
      include: [
        {
          model: RegisteredItem,
          as: 'registeredItems',
          attributes: ['id'],
          duplicating: false
        },
        {
          model: FoundItem,
          as: 'foundItems',
          attributes: ['id'],
          duplicating: false
        },
        {
          model: VerificationLog,
          as: 'verifications',
          attributes: ['id'],
          duplicating: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      subQuery: false
    });

    const total = await User.count({ where });

    res.status(200).json({
      status: 'success',
      data: {
        users: users.map(user => ({
          ...user.toJSON(),
          registeredItemsCount: user.registeredItems?.length || 0,
          foundItemsCount: user.foundItems?.length || 0,
          verificationsCount: user.verifications?.length || 0
        })),
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { account_status } = req.body;
    if (!['active', 'suspended', 'deactivated'].includes(account_status)) {
      return next(new AppError('Invalid account status', 400));
    }
    if (req.params.userId === req.user.id) return next(new AppError('You cannot change your own account status', 400));
    const user = await User.findByPk(req.params.userId);
    if (!user) return next(new AppError('User not found', 404));
    const previousStatus = user.account_status;
    await user.update({ account_status });
    res.locals.activity = {
      description: `Changed ${user.email}'s account status from ${previousStatus} to ${account_status}`,
      metadata: { target_user_email: user.email, target_user_name: user.full_name, previous_status: previousStatus, new_status: account_status }
    };
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.userId === req.user.id) return next(new AppError('You cannot delete your own account', 400));
    const user = await User.findByPk(req.params.userId);
    if (!user) return next(new AppError('User not found', 404));
    const { email, full_name: fullName, role } = user;
    await user.destroy();
    // The account is gone, so keep who it was in the log entry itself.
    res.locals.activity = {
      description: `Deleted the account of ${fullName || email} (${email})`,
      metadata: { target_user_email: email, target_user_name: fullName, target_user_role: role }
    };
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] }],
      order: [['created_at', 'DESC']],
      limit: Math.min(parseInt(req.query.limit, 10) || 50, 100)
    });
    res.status(200).json({ success: true, data: { payments, annualAmount: await getAnnualAmount(), receivingNumber: await getReceivingNumber() } });
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentSettings = async (req, res, next) => {
  try {
    const amount = Number(req.body.annual_amount_rwf);
    if (!Number.isInteger(amount) || amount < 100) return next(new AppError('Annual amount must be at least 100 RWF.', 400));
    const enteredReceivingNumber = String(req.body.receiving_number || '').trim();
    const compactReceivingNumber = enteredReceivingNumber.replace(/[\s()-]/g, '');
    let receivingNumber = '';

    if (compactReceivingNumber) {
      if (/^07\d{8}$/.test(compactReceivingNumber)) {
        receivingNumber = `+250${compactReceivingNumber.slice(1)}`;
      } else if (/^\+?2507\d{8}$/.test(compactReceivingNumber)) {
        receivingNumber = compactReceivingNumber.startsWith('+')
          ? compactReceivingNumber
          : `+${compactReceivingNumber}`;
      } else {
        return next(new AppError('Enter a valid Rwanda mobile-money number, for example 0781234567 or +250781234567.', 400));
      }
    }
    const [previousAmount, previousReceivingNumber] = await Promise.all([getAnnualAmount(), getReceivingNumber()]);
    await setAnnualAmount(amount);
    await setReceivingNumber(receivingNumber);
    const changes = [];
    if (previousAmount !== amount) changes.push(`annual price ${previousAmount} → ${amount} RWF`);
    if ((previousReceivingNumber || '') !== receivingNumber) changes.push('receiving number');
    res.locals.activity = {
      description: changes.length ? `Changed payment settings: ${changes.join(', ')}` : 'Saved payment settings (no changes)',
      metadata: {
        previous_annual_amount_rwf: previousAmount,
        annual_amount_rwf: amount,
        previous_receiving_number: previousReceivingNumber,
        receiving_number: receivingNumber
      }
    };
    res.status(200).json({ success: true, data: { annualAmount: amount, receivingNumber } });
  } catch (error) { next(error); }
};

exports.activateUserSubscription = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return next(new AppError('User not found', 404));
    const subscription = await activateSubscription(user);
    res.locals.activity = {
      description: `Manually activated a 1-year subscription for ${user.email}`,
      metadata: { target_user_email: user.email, target_user_name: user.full_name, subscription_expires_at: user.subscription_expires_at }
    };
    res.status(200).json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

// =====================
// GET USER DETAILED ACTIVITY
// =====================
exports.getUserActivity = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 30;
    const offset = parseInt(req.query.offset) || 0;

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ['password_hash', 'password_changed_at']
      }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const activities = await ActivityLog.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    const stats = {
      registeredItems: await RegisteredItem.count({ where: { user_id: userId } }),
      foundItems: await FoundItem.count({ where: { user_id: userId } }),
      verifications: await VerificationLog.count({ where: { verifier_id: userId } }),
      statusChanges: await StatusChangeLog.count({ where: { changed_by: userId } })
    };

    res.status(200).json({
      status: 'success',
      data: {
        user,
        stats,
        activities,
        pagination: {
          limit,
          offset
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// GET SYSTEM METRICS
// =====================
exports.getSystemMetrics = async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const timeRange = req.query.timeRange || '30'; // days
    const days = parseInt(timeRange);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Time-series metrics and current platform breakdowns.
    const [itemsOverTime, foundItemsOverTime, usersOverTime, paymentsOverTime, matchesOverTime, verificationsOverTime, topDevices, roleDistribution, itemStatusDistribution, foundStatusDistribution, paymentStatusDistribution, totals] = await Promise.all([
    sequelize.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM registered_items
       WHERE created_at >= :startDate
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at)`,
      {
        replacements: { startDate },
        type: sequelize.QueryTypes.SELECT
      }
    ),

    sequelize.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count FROM found_items WHERE created_at >= :startDate GROUP BY DATE(created_at) ORDER BY DATE(created_at)`,
      { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }
    ),

    sequelize.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count FROM users WHERE created_at >= :startDate GROUP BY DATE(created_at) ORDER BY DATE(created_at)`,
      { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }
    ),

    sequelize.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count, COALESCE(SUM(amount) FILTER (WHERE status = 'successful'), 0) as amount FROM payments WHERE created_at >= :startDate GROUP BY DATE(created_at) ORDER BY DATE(created_at)`,
      { replacements: { startDate }, type: sequelize.QueryTypes.SELECT }
    ),

    // Matches created over time
    sequelize.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM matches
       WHERE created_at >= :startDate
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at)`,
      {
        replacements: { startDate },
        type: sequelize.QueryTypes.SELECT
      }
    ),

    // Verifications over time
    sequelize.query(
      `SELECT DATE(verified_at) as date, COUNT(*) as count
      FROM verification_logs
      WHERE verified_at >= :startDate
      GROUP BY DATE(verified_at)
      ORDER BY DATE(verified_at)`,
      {
        replacements: { startDate },
        type: sequelize.QueryTypes.SELECT
      }
    ),

    // Top devices by registration count
    sequelize.query(
      `SELECT dt.display_name as model_name, COUNT(ri.id) as count
       FROM device_types dt
       LEFT JOIN registered_items ri ON dt.id = ri.device_type_id
       GROUP BY dt.id, dt.display_name
       ORDER BY count DESC
       LIMIT 10`,
      { type: sequelize.QueryTypes.SELECT }
    ),

    // User roles distribution
    User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role'],
      raw: true
    }),
    sequelize.query(`SELECT status as label, COUNT(*) as count FROM registered_items GROUP BY status ORDER BY count DESC`, { type: sequelize.QueryTypes.SELECT }),
    sequelize.query(`SELECT status as label, COUNT(*) as count FROM found_items GROUP BY status ORDER BY count DESC`, { type: sequelize.QueryTypes.SELECT }),
    sequelize.query(`SELECT status as label, COUNT(*) as count, COALESCE(SUM(amount), 0) as amount FROM payments GROUP BY status ORDER BY count DESC`, { type: sequelize.QueryTypes.SELECT }),
    sequelize.query(`SELECT (SELECT COUNT(*) FROM users) as users, (SELECT COUNT(*) FROM registered_items) as registered_items, (SELECT COUNT(*) FROM found_items) as found_items, (SELECT COUNT(*) FROM matches) as matches, (SELECT COUNT(*) FROM payments WHERE status = 'successful') as successful_payments, (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'successful') as payment_revenue`, { type: sequelize.QueryTypes.SELECT })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        timeRange: `${days} days`,
        itemsOverTime,
        foundItemsOverTime,
        usersOverTime,
        paymentsOverTime,
        matchesOverTime,
        verificationsOverTime,
        topDevices,
        roleDistribution
        , itemStatusDistribution,
        foundStatusDistribution,
        paymentStatusDistribution,
        totals: totals[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// LOG USER ACTIVITY
// =====================
exports.logActivity = async (userId, actionType, resourceType, resourceId, description, metadata = {}, req = null) => {
  await recordActivity({
    action: actionType,
    resource: resourceType,
    resourceId,
    description,
    metadata,
    actor: req?.user,
    subjectUserId: userId,
    req
  });
};
