-- Add Rwanda administrative location fields to found-item reports.
ALTER TABLE found_items
  ADD COLUMN IF NOT EXISTS found_district VARCHAR(100),
  ADD COLUMN IF NOT EXISTS found_sector VARCHAR(100);