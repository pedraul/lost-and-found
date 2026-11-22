ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_trial_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS payment_due_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS payment_reminder_sent_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS duration_months INTEGER NOT NULL DEFAULT 12
    CHECK (duration_months BETWEEN 1 AND 12);

UPDATE users
SET subscription_trial_started_at = created_at,
    payment_due_at = created_at + INTERVAL '7 days'
WHERE subscription_trial_started_at IS NULL
  AND EXISTS (
    SELECT 1 FROM registered_items WHERE registered_items.user_id = users.id
  );

CREATE INDEX IF NOT EXISTS users_payment_due_at_idx ON users (payment_due_at);