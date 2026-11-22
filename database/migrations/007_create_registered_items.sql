-- =============================================
-- MIGRATION: 007_create_registered_items.sql
-- =============================================

CREATE TABLE registered_items (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Device Selection
    device_type_id UUID NOT NULL REFERENCES device_types(id),
    manufacturer_id UUID REFERENCES manufacturers(id),

    -- Basic Information
    item_name VARCHAR(255) NOT NULL,
    model VARCHAR(100) NOT NULL,

    -- Identifiers (Conditional based on device type)
    serial_number VARCHAR(100) UNIQUE,
    imei_number VARCHAR(15) UNIQUE,
    vin_number VARCHAR(17) UNIQUE,
    id_number VARCHAR(100) UNIQUE,
    passport_number VARCHAR(20) UNIQUE,
    license_plate VARCHAR(20),
    frame_size VARCHAR(20),

    -- Document Fields (All devices)
    full_name VARCHAR(255),
    date_of_birth DATE,
    issuing_country VARCHAR(100),
    expiry_date DATE,

    -- Vehicle Fields (All vehicles)
    year INTEGER,

    -- Purchase Information
    cost DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    purchase_date DATE,
    purchase_store_name VARCHAR(255),

    -- Required Images (All devices)
    receipt_image_url VARCHAR(500) NOT NULL,
    receipt_file_name VARCHAR(255) NOT NULL,
    front_image_url VARCHAR(500) NOT NULL,
    front_file_name VARCHAR(255) NOT NULL,
    back_image_url VARCHAR(500) NOT NULL,
    back_file_name VARCHAR(255) NOT NULL,
    serial_image_url VARCHAR(500) NOT NULL,
    serial_file_name VARCHAR(255) NOT NULL,

    -- Additional Images (Device-specific)
    screen_image_url VARCHAR(500),
    screen_file_name VARCHAR(255),
    side_image_url VARCHAR(500),
    side_file_name VARCHAR(255),
    interior_image_url VARCHAR(500),
    interior_file_name VARCHAR(255),
    cargo_image_url VARCHAR(500),
    cargo_file_name VARCHAR(255),
    drivetrain_image_url VARCHAR(500),
    drivetrain_file_name VARCHAR(255),
    frame_image_url VARCHAR(500),
    frame_file_name VARCHAR(255),
    full_bike_image_url VARCHAR(500),
    full_bike_file_name VARCHAR(255),
    id_front_image_url VARCHAR(500),
    id_front_file_name VARCHAR(255),
    id_back_image_url VARCHAR(500),
    id_back_file_name VARCHAR(255),
    passport_photo_image_url VARCHAR(500),
    passport_photo_file_name VARCHAR(255),
    passport_id_image_url VARCHAR(500),
    passport_id_file_name VARCHAR(255),

    -- Verification Code (Auto-generated)
    verification_code VARCHAR(19) UNIQUE NOT NULL,
    verification_code_hash VARCHAR(255) UNIQUE NOT NULL,
    qr_code_url VARCHAR(500),

    -- Status
    status VARCHAR(20) DEFAULT 'active',
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    trust_score INT DEFAULT 0,

    -- Ownership
    ownership_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ownership_end_date TIMESTAMP,
    previous_owner_id UUID REFERENCES users(id),
    transfer_count INT DEFAULT 0,
    last_verified_at TIMESTAMP,

    -- Additional
    notes TEXT,
    tags TEXT[],
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('active', 'lost', 'stolen', 'returned', 'deleted', 'transferred'))
);

-- Indexes
CREATE INDEX idx_items_user_id ON registered_items(user_id);
CREATE INDEX idx_items_device_type ON registered_items(device_type_id);
CREATE INDEX idx_items_manufacturer ON registered_items(manufacturer_id);
CREATE INDEX idx_items_status ON registered_items(status);
CREATE INDEX idx_items_serial ON registered_items(serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX idx_items_imei ON registered_items(imei_number) WHERE imei_number IS NOT NULL;
CREATE INDEX idx_items_vin ON registered_items(vin_number) WHERE vin_number IS NOT NULL;
CREATE INDEX idx_items_id_number ON registered_items(id_number) WHERE id_number IS NOT NULL;
CREATE INDEX idx_items_passport ON registered_items(passport_number) WHERE passport_number IS NOT NULL;
CREATE INDEX idx_items_verification ON registered_items(verification_code);
CREATE INDEX idx_items_created ON registered_items(created_at DESC);
CREATE INDEX idx_items_tags ON registered_items USING GIN(tags);