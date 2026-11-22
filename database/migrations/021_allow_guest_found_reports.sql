ALTER TABLE found_items
  ALTER COLUMN reporter_id DROP NOT NULL;

ALTER TABLE found_items
  DROP CONSTRAINT IF EXISTS found_items_reporter_id_fkey;

ALTER TABLE found_items
  ADD CONSTRAINT found_items_reporter_id_fkey
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL;
