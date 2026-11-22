-- =============================================
-- MIGRATION: 008_create_found_items.sql
-- =============================================

CREATE TABLE found_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reporter_name VARCHAR(255) NOT NULL,
    reporter_email VARCHAR(255),
    reporter_phone VARCHAR(20),
    item_name VARCHAR(255) NOT NULL,
    item_category VARCHAR(50) NOT NULL,
    item_description TEXT,
    serial_number VARCHAR(100),
    imei_number VARCHAR(15),
    vin_number VARCHAR(17),
    passport_number VARCHAR(20),
    id_number VARCHAR(100),
    license_plate VARCHAR(20),
    frame_size VARCHAR(20),
    condition VARCHAR(50),
    color VARCHAR(50),
    brand VARCHAR(100),
    model VARCHAR(100),
    distinctive_marks TEXT,
    additional_notes TEXT,
    found_location TEXT NOT NULL,
    found_latitude DECIMAL(10,8),
    found_longitude DECIMAL(11,8),
    found_address TEXT,
    found_city VARCHAR(100),
    found_country VARCHAR(100),
    found_date DATE NOT NULL,
    found_time TIME,
    found_datetime TIMESTAMP,
    found_verification_code VARCHAR(19) UNIQUE NOT NULL,
    found_verification_hash VARCHAR(255) UNIQUE NOT NULL,
    qr_code_url VARCHAR(500),
    overall_image_url VARCHAR(500) NOT NULL,
    overall_file_name VARCHAR(255) NOT NULL,
    serial_image_url VARCHAR(500) NOT NULL,
    serial_file_name VARCHAR(255) NOT NULL,
    front_image_url VARCHAR(500),
    front_file_name VARCHAR(255),
    back_image_url VARCHAR(500),
    back_file_name VARCHAR(255),
    side_image_url VARCHAR(500),
    side_file_name VARCHAR(255),
    interior_image_url VARCHAR(500),
    interior_file_name VARCHAR(255),
    damage_image_url VARCHAR(500),
    damage_file_name VARCHAR(255),
    distinctive_image_url VARCHAR(500),
    distinctive_file_name VARCHAR(255),
    status VARCHAR(30) DEFAULT 'pending',
    matched_item_id UUID REFERENCES registered_items(id),
    matched_by UUID REFERENCES users(id),
    matched_at TIMESTAMP,
    match_confidence_score DECIMAL(5,2),
    claimed_by UUID REFERENCES users(id),
    claimed_at TIMESTAMP,
    claim_status VARCHAR(30),
    claim_notes TEXT,
    claim_proof_details TEXT,
    returned_to UUID REFERENCES users(id),
    returned_at TIMESTAMP,
    return_notes TEXT,
    expires_at TIMESTAMP,
    is_expired BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    show_reporter_contact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'matched', 'claimed', 'returned', 'resolved', 'expired')),
    CONSTRAINT valid_claim_status CHECK (claim_status IN ('pending_review', 'approved', 'rejected', 'awaiting_return', 'completed')),
    CONSTRAINT valid_condition CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor', 'Damaged'))
);

-- Indexes
CREATE INDEX idx_found_items_reporter ON found_items(reporter_id);
CREATE INDEX idx_found_items_status ON found_items(status);
CREATE INDEX idx_found_items_category ON found_items(item_category);
CREATE INDEX idx_found_items_serial ON found_items(serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX idx_found_items_imei ON found_items(imei_number) WHERE imei_number IS NOT NULL;
CREATE INDEX idx_found_items_vin ON found_items(vin_number) WHERE vin_number IS NOT NULL;
CREATE INDEX idx_found_items_passport ON found_items(passport_number) WHERE passport_number IS NOT NULL;
CREATE INDEX idx_found_items_id ON found_items(id_number) WHERE id_number IS NOT NULL;
CREATE INDEX idx_found_items_plate ON found_items(license_plate) WHERE license_plate IS NOT NULL;
CREATE INDEX idx_found_items_location ON found_items(found_latitude, found_longitude);
CREATE INDEX idx_found_items_city ON found_items(found_city);
CREATE INDEX idx_found_items_country ON found_items(found_country);
CREATE INDEX idx_found_items_date ON found_items(found_date);
CREATE INDEX idx_found_items_created ON found_items(created_at DESC);
CREATE INDEX idx_found_items_expires ON found_items(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_found_items_matched ON found_items(matched_item_id) WHERE matched_item_id IS NOT NULL;
CREATE INDEX idx_found_items_verification ON found_items(found_verification_code);
CREATE INDEX idx_found_items_claimed_by ON found_items(claimed_by) WHERE claimed_by IS NOT NULL;
CREATE INDEX idx_found_items_claim_status ON found_items(claim_status) WHERE claim_status IS NOT NULL;