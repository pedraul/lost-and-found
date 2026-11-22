-- =============================================
-- COMPLETE DATABASE SCHEMA
-- Lost & Found Platform
-- Version: 4.0
-- =============================================

-- =============================================
-- 1. CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. DEVICE TYPES TABLE
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

-- =============================================
-- 3. MANUFACTURERS TABLE
-- =============================================
CREATE TABLE manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    logo_url VARCHAR(500),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. DEVICE MODELS TABLE
-- =============================================
CREATE TABLE device_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
    model_name VARCHAR(255) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    year_start INT,
    year_end INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manufacturer_id, model_name)
);

-- =============================================
-- 5. DEVICE TYPE MANUFACTURERS (Many-to-Many)
-- =============================================
CREATE TABLE device_type_manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_type_id UUID NOT NULL REFERENCES device_types(id) ON DELETE CASCADE,
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_type_id, manufacturer_id)
);

-- =============================================
-- 6. USERS TABLE (Required for Foreign Keys)
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    trust_score INT DEFAULT 100,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT valid_role CHECK (role IN ('user', 'admin', 'enterprise'))
);

-- =============================================
-- 7. REGISTERED ITEMS (MASTER TABLE)
-- =============================================
CREATE TABLE registered_items (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Device Selection
    device_type_id UUID NOT NULL REFERENCES device_types(id),
    manufacturer_id UUID REFERENCES manufacturers(id),

    -- =========================================
    -- REQUIRED FIELDS FOR ALL DEVICES
    -- =========================================
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

    -- Contact/location returned after an exact identifier search
    country VARCHAR(100),
    city VARCHAR(100),
    province VARCHAR(100),
    district VARCHAR(100),
    sector VARCHAR(100),
    phone_number VARCHAR(20),

    -- =========================================
    -- REQUIRED IMAGES (All devices)
    -- =========================================
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

    -- =========================================
    -- VERIFICATION CODE (Auto-generated)
    -- =========================================
    verification_code VARCHAR(19) UNIQUE NOT NULL,
    verification_code_hash VARCHAR(255) UNIQUE NOT NULL,
    qr_code_url VARCHAR(500),

    -- =========================================
    -- STATUS
    -- =========================================
    status VARCHAR(20) DEFAULT 'active',
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    trust_score INT DEFAULT 0,

    -- =========================================
    -- OWNERSHIP
    -- =========================================
    ownership_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ownership_end_date TIMESTAMP,
    previous_owner_id UUID REFERENCES users(id),
    transfer_count INT DEFAULT 0,
    last_verified_at TIMESTAMP,

    -- =========================================
    -- ADDITIONAL
    -- =========================================
    notes TEXT,
    tags TEXT[],
    -- =========================================
    -- AUDIT
    -- =========================================
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    -- =========================================
    -- CONSTRAINTS
    -- =========================================
    CONSTRAINT valid_status CHECK (status IN ('active', 'lost', 'stolen', 'returned', 'deleted', 'transferred'))
);

-- =============================================
-- 8. INDEXES
-- =============================================
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

-- =============================================
-- 9. VERIFICATION LOGS TABLE
-- =============================================
CREATE TABLE verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES registered_items(id) ON DELETE CASCADE,
    verifier_id UUID REFERENCES users(id),
    verification_code VARCHAR(19) NOT NULL,
    verification_method VARCHAR(20) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    location VARCHAR(255),
    result VARCHAR(20) NOT NULL,
    failure_reason TEXT,
    notes TEXT,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_verification_logs_item ON verification_logs(item_id);
CREATE INDEX idx_verification_logs_code ON verification_logs(verification_code);
CREATE INDEX idx_verification_logs_result ON verification_logs(result);

-- =============================================
-- 10. ITEM TRANSACTIONS TABLE
-- =============================================
CREATE TABLE item_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES registered_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(30) NOT NULL,
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    transaction_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_transactions_item ON item_transactions(item_id);
CREATE INDEX idx_transactions_type ON item_transactions(transaction_type);

-- =============================================
-- 11. MATCHES TABLE
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

-- =============================================
-- 12. STATUS CHANGE LOGS TABLE
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

-- =============================================
-- 13. FOUND ITEMS TABLE (Unified Schema)
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

-- =============================================
-- 14. FOUND ITEMS INDEXES
-- =============================================
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

-- =============================================
-- 15. SEED DATA - CATEGORIES
-- =============================================
INSERT INTO categories (name, display_name, icon, description, display_order) VALUES
('electronics', 'Electronics', '📱', 'Electronic devices and gadgets', 1),
('vehicles', 'Vehicles', '🚗', 'Motor vehicles and bicycles', 2),
('audio', 'Audio', '🔊', 'Audio equipment and speakers', 3),
('accessories', 'Accessories', '⌚', 'Watches and personal accessories', 4),
('documents', 'Documents', '📄', 'Important identification documents', 5);