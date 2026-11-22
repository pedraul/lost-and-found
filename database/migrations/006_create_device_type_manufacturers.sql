-- =============================================
-- MIGRATION: 006_create_device_type_manufacturers.sql
-- =============================================

CREATE TABLE device_type_manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_type_id UUID NOT NULL REFERENCES device_types(id) ON DELETE CASCADE,
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_type_id, manufacturer_id)
);