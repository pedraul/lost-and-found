-- =============================================
-- MIGRATION: 009_create_matches.sql
-- =============================================

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    found_item_id UUID NOT NULL REFERENCES found_items(id) ON DELETE CASCADE,
    registered_item_id UUID NOT NULL REFERENCES registered_items(id) ON DELETE CASCADE,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    match_reason VARCHAR(255),
    match_method VARCHAR(50) DEFAULT 'identifier',
    status VARCHAR(20) DEFAULT 'pending',
    notified_owner_at TIMESTAMP,
    notified_finder_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_found ON matches(found_item_id);
CREATE INDEX idx_matches_registered ON matches(registered_item_id);
CREATE INDEX idx_matches_status ON matches(status);