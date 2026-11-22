const { Op, where, cast, col, fn } = require('sequelize');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { AppError } = require('../middleware/error.middleware');

const CATEGORIES = ['payment', 'account', 'item', 'found_item', 'match', 'verification', 'search', 'report', 'admin', 'security', 'other'];
const ROLES = ['user', 'admin', 'guest', 'system'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXPORT_LIMIT = 10000;

const likeTerm = (value) => `%${String(value).trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

const parseDate = (value, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}` : value);
  if (Number.isNaN(date.getTime())) throw new AppError(`Invalid date: ${value}`, 400);
  return date;
};

/** Builds the WHERE clause shared by the list, summary and export. */
const buildWhere = (query, { includeCategory = true } = {}) => {
  const conditions = [];
  const { category, action, outcome, role, user_id: userId, actor, q, from, to, resource_id: resourceId } = query;

  if (includeCategory && category && category !== 'all') {
    if (!CATEGORIES.includes(category)) throw new AppError('Unknown log category', 400);
    conditions.push({ category });
  }
  if (action) conditions.push({ action_type: String(action) });
  if (outcome && ['success', 'failure'].includes(outcome)) conditions.push({ outcome });
  if (role && ROLES.includes(role)) conditions.push({ actor_role: role });
  if (userId) {
    if (!UUID_RE.test(userId)) throw new AppError('Invalid user id', 400);
    conditions.push({ user_id: userId });
  }
  if (resourceId) {
    if (!UUID_RE.test(resourceId)) throw new AppError('Invalid resource id', 400);
    conditions.push({ resource_id: resourceId });
  }
  if (actor) {
    const term = likeTerm(actor);
    conditions.push({ [Op.or]: [{ actor_email: { [Op.iLike]: term } }, { actor_name: { [Op.iLike]: term } }] });
  }
  if (q) {
    const term = likeTerm(q);
    conditions.push({
      [Op.or]: [
        { description: { [Op.iLike]: term } },
        { action_type: { [Op.iLike]: term } },
        { path: { [Op.iLike]: term } },
        { actor_email: { [Op.iLike]: term } },
        // Lets admins find e.g. a Paypack reference or amount inside the details.
        where(cast(col('metadata'), 'text'), { [Op.iLike]: term })
      ]
    });
  }
  const fromDate = parseDate(from);
  const toDate = parseDate(to, true);
  if (fromDate || toDate) {
    conditions.push({ created_at: { ...(fromDate ? { [Op.gte]: fromDate } : {}), ...(toDate ? { [Op.lte]: toDate } : {}) } });
  }
  return conditions.length ? { [Op.and]: conditions } : {};
};

const userInclude = { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'role'], required: false };

// GET /admin/logs
exports.getLogs = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const whereClause = buildWhere(req.query);

    const [{ rows, count }, categoryCounts, failures] = await Promise.all([
      ActivityLog.findAndCountAll({ where: whereClause, include: [userInclude], order: [['created_at', 'DESC']], limit, offset }),
      // Counts per category under the other filters, for the filter chips.
      ActivityLog.findAll({
        where: buildWhere(req.query, { includeCategory: false }),
        attributes: ['category', [fn('COUNT', col('id')), 'count']],
        group: ['category'],
        raw: true
      }),
      ActivityLog.count({ where: { [Op.and]: [whereClause, { outcome: 'failure' }] } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs: rows,
        pagination: { total: count, limit, offset },
        summary: {
          failures,
          categories: Object.fromEntries(categoryCounts.map((entry) => [entry.category, Number(entry.count)]))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /admin/logs/actions — distinct action names for the filter dropdown
exports.getLogActions = async (req, res, next) => {
  try {
    const actions = await ActivityLog.findAll({
      attributes: ['category', 'action_type', [fn('COUNT', col('id')), 'count']],
      group: ['category', 'action_type'],
      order: [['category', 'ASC'], ['action_type', 'ASC']],
      raw: true
    });
    res.status(200).json({ success: true, data: { actions: actions.map((a) => ({ ...a, count: Number(a.count) })) } });
  } catch (error) {
    next(error);
  }
};

// Spreadsheet apps execute cells starting with these characters as formulas.
const csvCell = (value) => {
  if (value === null || value === undefined) return '';
  let text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// GET /admin/logs/export — CSV of the filtered logs (newest first)
exports.exportLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.findAll({
      where: buildWhere(req.query),
      include: [userInclude],
      order: [['created_at', 'DESC']],
      limit: EXPORT_LIMIT
    });

    const header = ['Time (UTC)', 'Category', 'Action', 'Outcome', 'Actor role', 'Actor name', 'Actor email', 'Account', 'Description',
      'Resource type', 'Resource ID', 'Method', 'Path', 'HTTP status', 'IP address', 'User agent', 'Details'];
    const lines = [header.map(csvCell).join(',')];
    for (const log of logs) {
      lines.push([
        new Date(log.created_at).toISOString(), log.category, log.action_type, log.outcome, log.actor_role,
        log.actor_name, log.actor_email, log.user?.email, log.description, log.resource_type, log.resource_id,
        log.http_method, log.path, log.status_code, log.ip_address, log.user_agent, log.metadata
      ].map(csvCell).join(','));
    }

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="activity-logs-${stamp}.csv"`);
    res.setHeader('X-Export-Truncated', logs.length >= EXPORT_LIMIT ? 'true' : 'false');
    res.status(200).send(`﻿${lines.join('\r\n')}`);
  } catch (error) {
    next(error);
  }
};

module.exports.CATEGORIES = CATEGORIES;
