const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { recordActivity } = require('../services/audit-log.service');

/**
 * Records every state-changing API request (and a few sensitive look-ups) in
 * the activity log once the response has been sent: who, what, outcome, when,
 * from where. Request bodies are never stored, so passwords and payment
 * details cannot leak into the log.
 *
 * Controllers can enrich the entry through res.locals.activity:
 *   res.locals.activity = { description, metadata, resourceId, actor }
 * or skip it (when they log the event themselves) with res.locals.activity = false.
 */

const UUID = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
const UUID_RE = new RegExp(`^${UUID}$`);
const ID = `(${UUID}|[^/]+)`;

// [method, path regex (after /api), action, category, resource, description]
const ROUTES = [
  // Accounts
  ['POST', /^\/auth\/register$/, 'user_registered', 'account', 'user', 'Created an account'],
  ['POST', /^\/auth\/login$/, 'user_login', 'account', 'user', 'Logged in'],
  ['POST', /^\/auth\/logout$/, 'user_logout', 'account', 'user', 'Logged out'],
  ['POST', /^\/auth\/forgot-password$/, 'password_reset_requested', 'account', 'user', 'Requested a password reset'],
  ['POST', /^\/auth\/reset-password$/, 'password_reset', 'account', 'user', 'Reset password with an emailed link'],
  ['POST', /^\/auth\/change-password$/, 'password_changed', 'account', 'user', 'Changed password'],
  ['PATCH', /^\/users\/me$/, 'profile_updated', 'account', 'user', 'Updated profile'],
  ['DELETE', /^\/users\/me$/, 'account_deleted', 'account', 'user', 'Deleted own account'],

  // Payments
  ['POST', /^\/payments\/checkout$/, 'payment_checkout_started', 'payment', 'payment', 'Started a payment checkout'],
  ['POST', /^\/payments\/mock\/complete$/, 'payment_test_completed', 'payment', 'payment', 'Completed a test (mock) payment'],

  // Registered items
  ['POST', /^\/items$/, 'item_registered', 'item', 'registered_item', 'Registered an item'],
  ['PATCH', new RegExp(`^/items/${ID}$`), 'item_updated', 'item', 'registered_item', 'Updated an item'],
  ['DELETE', new RegExp(`^/items/${ID}$`), 'item_deleted', 'item', 'registered_item', 'Deleted an item'],

  // Found items
  ['POST', /^\/found-items$/, 'found_item_reported', 'found_item', 'found_item', 'Reported a found item'],
  ['POST', new RegExp(`^/found-items/${ID}/match$`), 'found_item_matched', 'match', 'found_item', 'Matched a found item to a registered item'],
  ['POST', new RegExp(`^/found-items/${ID}/claim$`), 'found_item_claimed', 'found_item', 'found_item', 'Claimed a found item'],

  // Matches & verification
  ['PATCH', new RegExp(`^/matches/${ID}$`), 'match_status_changed', 'match', 'match', 'Changed a match status'],
  ['POST', /^\/verifications\/verify-code$/, 'verification_code_checked', 'verification', 'verification', 'Checked a verification code'],
  ['POST', new RegExp(`^/verifications/${ID}$`), 'verification_created', 'verification', 'verification', 'Started an ownership verification'],

  // Sensitive look-ups (GET, but worth auditing)
  ['GET', /^\/search$/, 'item_searched', 'search', 'registered_item', 'Searched the registry by identifier'],
  ['GET', /^\/items\/search\/[^/]+\/[^/]+$/, 'item_searched', 'search', 'registered_item', 'Searched the registry by identifier'],
  ['GET', new RegExp(`^/reports/${ID}$`), 'item_report_generated', 'report', 'registered_item', 'Generated an item report'],
  ['GET', /^\/admin\/logs\/export$/, 'admin_logs_exported', 'admin', 'activity_log', 'Exported activity logs'],
  ['GET', /^\/admin\/reports$/, 'admin_report_viewed', 'admin', 'report', 'Opened an admin report'],

  // Admin actions
  ['PATCH', /^\/admin\/payments\/settings$/, 'payment_settings_updated', 'payment', 'payment_setting', 'Changed payment settings'],
  ['POST', new RegExp(`^/admin/users/${ID}/subscription$`), 'subscription_activated_by_admin', 'payment', 'user', 'Manually activated a subscription'],
  ['PATCH', new RegExp(`^/admin/users/${ID}/status$`), 'user_status_changed', 'admin', 'user', 'Changed a user’s account status'],
  ['DELETE', new RegExp(`^/admin/users/${ID}$`), 'user_deleted_by_admin', 'admin', 'user', 'Deleted a user account'],
];

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
// Too frequent to be useful in an audit trail.
const IGNORED = [/^\/auth\/refresh-token$/];
// Query keys that are safe and useful to keep for audited look-ups.
const SAFE_QUERY_KEYS = ['type', 'identifierType', 'identifier', 'q', 'category', 'source', 'status', 'from', 'to'];

const match = (method, path) => ROUTES.find(([m, re]) => m === method && re.test(path));

// Identify the caller for routes that run without `protect` (e.g. logout).
const actorFromToken = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(header.slice(7), env.jwt.secret);
    return { id: decoded.id, email: decoded.email, full_name: decoded.full_name, role: decoded.role };
  } catch (error) {
    return null;
  }
};

const firstUuid = (...values) => values.find((value) => typeof value === 'string' && UUID_RE.test(value));

const resourceIdFrom = (path, body) => {
  const fromPath = path.split('/').find((segment) => UUID_RE.test(segment));
  if (fromPath) return fromPath;
  const data = body?.data;
  if (!data || typeof data !== 'object') return undefined;
  return firstUuid(
    data.id, data.item?.id, data.foundItem?.id, data.found_item?.id, data.payment?.id,
    data.verification?.id, data.match?.id, data.user?.id
  );
};

const activityLogger = (req, res, next) => {
  const path = req.path; // relative to the /api mount point
  const rule = match(req.method, path);
  const shouldLog = !IGNORED.some((re) => re.test(path)) && (rule || MUTATING.has(req.method));
  if (!shouldLog) return next();

  const startedAt = Date.now();
  let responseBody;
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on('finish', () => {
    const extra = res.locals.activity;
    if (extra === false) return;

    const [, , action, category, resource, description] = rule || [
      req.method, null, `api_${req.method.toLowerCase()}`, 'other', 'api', `${req.method} ${path}`
    ];
    const failed = res.statusCode >= 400;

    let actor = extra?.actor || req.user || res.locals.activityActor || actorFromToken(req);
    // Failed sign-ins have no account yet; keep the attempted email for security review.
    if (!actor && path.startsWith('/auth/') && typeof req.body?.email === 'string') {
      actor = { role: 'guest', email: req.body.email.slice(0, 255) };
    }

    const query = Object.fromEntries(Object.entries(req.query || {}).filter(([key]) => SAFE_QUERY_KEYS.includes(key)));
    const metadata = {
      duration_ms: Date.now() - startedAt,
      ...(Object.keys(query).length ? { query } : {}),
      ...(failed && responseBody?.message ? { error: String(responseBody.message).slice(0, 300) } : {}),
      ...(extra?.metadata || {})
    };

    const failedLogin = failed && action === 'user_login';
    recordActivity({
      action: failedLogin ? 'user_login_failed' : action,
      category: failedLogin ? 'security' : category,
      resource,
      resourceId: extra?.resourceId || resourceIdFrom(path, responseBody),
      description: extra?.description || (failedLogin ? 'Failed login attempt' : failed ? `Failed: ${description}` : description),
      metadata,
      outcome: failed ? 'failure' : 'success',
      actor,
      req,
      statusCode: res.statusCode
    });
  });

  return next();
};

module.exports = { activityLogger, ROUTES };
