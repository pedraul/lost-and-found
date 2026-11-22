-- =============================================
-- MIGRATION: 011_create_status_change_logs.sql
-- =============================================

CREATE TABLE status_change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES registered_items(id) ON DELETE CASCADE,
    item_type VARCHAR(30) DEFAULT 'registered_item',
    previous_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES users(id),
    reason VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status_logs_item ON status_change_logs(item_id);
CREATE INDEX idx_status_logs_status ON status_change_logs(new_status);