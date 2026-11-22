-- =============================================
-- MIGRATION: 010_create_search_logs.sql
-- =============================================

CREATE TABLE search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    search_type VARCHAR(30) NOT NULL,
    search_term VARCHAR(255) NOT NULL,
    identifier_type VARCHAR(50),
    results_count INT DEFAULT 0,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_search_logs_type ON search_logs(search_type);
CREATE INDEX idx_search_logs_created ON search_logs(created_at DESC);