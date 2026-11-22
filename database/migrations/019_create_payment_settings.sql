CREATE TABLE IF NOT EXISTS payment_settings (
  key VARCHAR(50) PRIMARY KEY,
  value VARCHAR(100) NOT NULL
);

INSERT INTO payment_settings (key, value)
VALUES ('annual_amount_rwf', '1000')
ON CONFLICT (key) DO NOTHING;
