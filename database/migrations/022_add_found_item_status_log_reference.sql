ALTER TABLE status_change_logs
  ADD COLUMN IF NOT EXISTS found_item_id UUID REFERENCES found_items(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS status_logs_found_item_idx
  ON status_change_logs(found_item_id);
