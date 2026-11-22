-- =============================================
-- MIGRATION: 003_create_device_types.sql
-- =============================================

CREATE TABLE device_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    -- Identifier Configuration
    has_serial_number BOOLEAN DEFAULT TRUE,
    has_unique_identifier BOOLEAN DEFAULT FALSE,
    identifier_label VARCHAR(50),
    identifier_placeholder VARCHAR(100),
    identifier_pattern VARCHAR(255),
    identifier_validation_message VARCHAR(255),
    -- Required Fields Configuration
    required_fields JSONB DEFAULT '[]'::jsonb,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);