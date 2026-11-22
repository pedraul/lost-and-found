ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) NOT NULL DEFAULT 'inactive';

ALTER TABLE users
  ADD CONSTRAINT users_subscription_status_check
  CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled'));

CREATE INDEX IF NOT EXISTS users_subscription_expires_at_idx
  ON users (subscription_expires_at);
