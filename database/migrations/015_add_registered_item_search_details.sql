-- Store the contact and location entered during item registration.
ALTER TABLE registered_items
  ADD COLUMN IF NOT EXISTS country VARCHAR(100),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS province VARCHAR(100),
  ADD COLUMN IF NOT EXISTS district VARCHAR(100),
  ADD COLUMN IF NOT EXISTS sector VARCHAR(100),
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);