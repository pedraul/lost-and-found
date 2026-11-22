const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 0781234567 -> 078****567. Logs must never undo the payment-field encryption. */
const maskPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length < 7) return digits ? '****' : null;
  return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
};

const SENSITIVE_KEY = /pass(word)?|token|secret|authorization|otp|code|cvv|card/i;

/** Removes secrets from metadata before it is stored. */
const sanitize = (value, depth = 0) => {
  if (value === null || value === undefined || depth > 4) return value;
  if (Array.isArray(value)) return value.slice(0, 50).map((entry) => sanitize(entry, depth + 1));
  if (typeof value !== 'object') {
    return typeof value === 'string' && value.length > 500 ? `${value.slice(0, 500)}…` : value;
  }
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => {
    if (SENSITIVE_KEY.test(key)) return [key, '[redacted]'];
    if (/phone|number|msisdn/i.test(key) && typeof entry === 'string' && /\d{7,}/.test(entry)) return [key, maskPhone(entry)];
    return [key, sanitize(entry, depth + 1)];
  }));
};

const actorFrom = (actor) => {
  if (!actor) return { user_id: null, actor_role: 'guest', actor_email: null, actor_name: null };
  return {
    user_id: actor.id && UUID_RE.test(actor.id) ? actor.id : null,
    actor_role: actor.role || 'user',
    actor_email: actor.email || null,
    actor_name: actor.full_name || actor.name || null
  };
};

/**
 * Write one audit-log entry. Never throws: a logging failure must not break
 * the action being logged.
 *
 * @param {object}  entry
 * @param {string}  entry.action      e.g. 'payment_successful'
 * @param {string}  entry.category    payment | account | item | found_item | match | verification | search | report | admin | security | other
 * @param {string}  entry.resource    e.g. 'payment'
 * @param {string}  [entry.resourceId]
 * @param {string}  [entry.description]
 * @param {object}  [entry.metadata]
 * @param {'success'|'failure'} [entry.outcome]
 * @param {object}  [entry.actor]     user-like object { id, email, full_name, role }
 * @param {string}  [entry.subjectUserId] account the entry concerns, when the actor is the system
 * @param {object}  [entry.req]       Express request, for IP / user agent / path
 * @param {number}  [entry.statusCode]
 */
const recordActivity = async ({
  action, category = 'other', resource, resourceId, description, metadata = {},
  outcome = 'success', actor, subjectUserId, req, statusCode
}) => {
  try {
    const actorFields = actorFrom(actor);
    if (!actorFields.user_id && subjectUserId && UUID_RE.test(subjectUserId)) actorFields.user_id = subjectUserId;

    return await ActivityLog.create({
      ...actorFields,
      category,
      action_type: String(action || 'unknown').slice(0, 50),
      resource_type: String(resource || category).slice(0, 50),
      resource_id: resourceId && UUID_RE.test(resourceId) ? resourceId : null,
      outcome,
      description: description || null,
      metadata: sanitize(metadata) || {},
      http_method: req?.method || null,
      path: req ? String(req.originalUrl || req.url || '').split('?')[0].slice(0, 500) : null,
      status_code: statusCode || null,
      ip_address: req?.ip ? req.ip.replace(/^::ffff:/, '') : null,
      user_agent: req?.get?.('user-agent') || null
    });
  } catch (error) {
    logger.error(`Audit log write failed (${action}): ${error.message}`);
    return null;
  }
};

/** Actor for events raised by the platform itself, e.g. a Paypack webhook. */
const systemActor = (name) => ({ role: 'system', full_name: name });

module.exports = { recordActivity, systemActor, maskPhone, sanitize };
