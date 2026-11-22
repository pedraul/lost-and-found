-- Activity logs become a full audit trail for the admin "Activity Logs" page:
-- payments, accounts, items, admin actions, security events and system events.
-- `npm run migrate` applies this automatically (scripts/run-migrations.js).

-- Guests, failed logins and system events (e.g. Paypack webhooks) have no user.
ALTER TABLE activity_logs ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE activity_logs
  ADD COLUMN IF NOT EXISTS actor_role VARCHAR(20) NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS actor_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS actor_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS category VARCHAR(30) NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS outcome VARCHAR(10) NOT NULL DEFAULT 'success',
  ADD COLUMN IF NOT EXISTS http_method VARCHAR(10),
  ADD COLUMN IF NOT EXISTS path VARCHAR(500),
  ADD COLUMN IF NOT EXISTS status_code INTEGER;

-- Keep the audit trail when an account is deleted (was ON DELETE CASCADE).
DO $$
DECLARE fk RECORD;
BEGIN
  FOR fk IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'activity_logs'::regclass AND contype = 'f'
      AND pg_get_constraintdef(oid) LIKE 'FOREIGN KEY (user_id)%'
  LOOP
    EXECUTE format('ALTER TABLE activity_logs DROP CONSTRAINT %I', fk.conname);
  END LOOP;
END $$;

ALTER TABLE activity_logs
  ADD CONSTRAINT activity_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Existing rows: copy who did it from the user record.
UPDATE activity_logs a
SET actor_email = u.email, actor_name = u.full_name, actor_role = COALESCE(u.role::text, 'user')
FROM users u
WHERE a.user_id = u.id AND a.actor_email IS NULL;

CREATE INDEX IF NOT EXISTS activity_logs_category ON activity_logs (category);
CREATE INDEX IF NOT EXISTS activity_logs_outcome ON activity_logs (outcome);
CREATE INDEX IF NOT EXISTS activity_logs_created_at ON activity_logs (created_at);
