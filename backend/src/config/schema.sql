-- =============================================
-- LOST & FOUND PLATFORM - DATABASE SCHEMA
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
    password_changed_at TIMESTAMP,
    verification_code VARCHAR(10),
    verification_code_expires TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    account_status VARCHAR(20) NOT NULL DEFAULT 'active',
    subscription_status VARCHAR(20) NOT NULL DEFAULT 'inactive',
    subscription_expires_at TIMESTAMP,
    subscription_trial_started_at TIMESTAMP,
    payment_due_at TIMESTAMP,
    payment_reminder_sent_at TIMESTAMP,
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

    -- =========================================
    -- REQUIRED IMAGES (ALL DEVICES)
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
-- 7. INDEXES
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
-- 8. VERIFICATION LOGS TABLE
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
-- 9. ITEM TRANSACTIONS TABLE
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
-- 11. SEED DATA - CATEGORIES
-- =============================================
INSERT INTO categories (name, display_name, icon, description, display_order) VALUES
('electronics', 'Electronics', '📱', 'Electronic devices and gadgets', 1),
('vehicles', 'Vehicles', '🚗', 'Motor vehicles and bicycles', 2),
('audio', 'Audio', '🔊', 'Audio equipment and speakers', 3),
('accessories', 'Accessories', '⌚', 'Watches and personal accessories', 4),
('documents', 'Documents', '📄', 'Important identification documents', 5);

-- =============================================
-- 12. SEED DATA - DEVICE TYPES
-- =============================================
INSERT INTO device_types (category_id, name, display_name, icon, description, has_serial_number, has_unique_identifier, identifier_label, identifier_placeholder, identifier_pattern, identifier_validation_message, required_fields, display_order) VALUES
((SELECT id FROM categories WHERE name = 'electronics'), 'phone', 'Phone', '📱', 'Mobile phones and smartphones', 
 TRUE, TRUE, 'IMEI', 'Enter 15-digit IMEI number', '^[0-9]{15}$', 'IMEI must be exactly 15 digits',
 '["item_name","manufacturer_id","model","serial_number","imei_number","receipt_image","front_image","back_image","serial_image"]', 1),
((SELECT id FROM categories WHERE name = 'electronics'), 'laptop', 'Laptop', '💻', 'Laptops and notebooks',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","receipt_image","front_image","back_image","screen_image","serial_image"]', 2),
((SELECT id FROM categories WHERE name = 'electronics'), 'tablet', 'Tablet', '📱', 'Tablets and iPads',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","receipt_image","front_image","back_image","screen_image","serial_image"]', 3),
((SELECT id FROM categories WHERE name = 'electronics'), 'tv', 'TV', '📺', 'Televisions',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","receipt_image","front_image","back_image","screen_image","serial_image"]', 4),
((SELECT id FROM categories WHERE name = 'electronics'), 'camera', 'Camera', '📷', 'Cameras and photography equipment',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","receipt_image","front_image","back_image","serial_image"]', 5),
((SELECT id FROM categories WHERE name = 'electronics'), 'scanner', 'Scanner', '🖨️', 'Document scanners',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","receipt_image","front_image","back_image","serial_image"]', 6),
((SELECT id FROM categories WHERE name = 'electronics'), 'printer', 'Printer', '🖨️', 'Printers',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","receipt_image","front_image","back_image","serial_image"]', 7),
((SELECT id FROM categories WHERE name = 'electronics'), 'projector', 'Projector', '📽️', 'Projectors',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","receipt_image","front_image","back_image","serial_image"]', 8),
((SELECT id FROM categories WHERE name = 'electronics'), 'hard_drive', 'Hard Drive', '💾', 'External and internal storage devices',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","receipt_image","front_image","back_image","serial_image"]', 9),
((SELECT id FROM categories WHERE name = 'electronics'), 'router', 'Router', '📶', 'Network routers and mesh systems',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","receipt_image","front_image","back_image","serial_image"]', 10),
((SELECT id FROM categories WHERE name = 'electronics'), 'solar_box', 'Solar Box', '☀️', 'Solar power systems and boxes',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","receipt_image","front_image","back_image","serial_image"]', 11),

-- Vehicles
((SELECT id FROM categories WHERE name = 'vehicles'), 'car', 'Car', '🚗', 'Cars and passenger vehicles',
 TRUE, TRUE, 'VIN', 'Enter 17-character VIN number', '^[A-HJ-NPR-Z0-9]{17}$', 'VIN must be exactly 17 characters',
 '["item_name","manufacturer_id","model","vin_number","license_plate","year","receipt_image","front_image","back_image","side_image","interior_image","serial_image"]', 12),
((SELECT id FROM categories WHERE name = 'vehicles'), 'motorcycle', 'Motorcycle', '🏍️', 'Motorcycles',
 TRUE, TRUE, 'VIN', 'Enter 17-character VIN number', '^[A-HJ-NPR-Z0-9]{17}$', 'VIN must be exactly 17 characters',
 '["item_name","manufacturer_id","model","vin_number","license_plate","year","receipt_image","front_image","back_image","side_image","interior_image","serial_image"]', 13),
((SELECT id FROM categories WHERE name = 'vehicles'), 'bicycle', 'Bicycle', '🚲', 'Bicycles and e-bikes',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","frame_size","receipt_image","full_bike_image","frame_image","serial_image","drivetrain_image"]', 14),
((SELECT id FROM categories WHERE name = 'vehicles'), 'truck', 'Truck', '🚛', 'Trucks and pickup trucks',
 TRUE, TRUE, 'VIN', 'Enter 17-character VIN number', '^[A-HJ-NPR-Z0-9]{17}$', 'VIN must be exactly 17 characters',
 '["item_name","manufacturer_id","model","vin_number","license_plate","year","receipt_image","front_image","back_image","side_image","cargo_image","serial_image"]', 15),
((SELECT id FROM categories WHERE name = 'vehicles'), 'van', 'Van', '🚐', 'Vans and minivans',
 TRUE, TRUE, 'VIN', 'Enter 17-character VIN number', '^[A-HJ-NPR-Z0-9]{17}$', 'VIN must be exactly 17 characters',
 '["item_name","manufacturer_id","model","vin_number","license_plate","year","receipt_image","front_image","back_image","side_image","interior_image","serial_image"]', 16),

-- Audio
((SELECT id FROM categories WHERE name = 'audio'), 'speaker', 'Speaker', '🔊', 'Audio speakers',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","receipt_image","front_image","back_image","serial_image"]', 17),

-- Accessories
((SELECT id FROM categories WHERE name = 'accessories'), 'watch', 'Watch', '⌚', 'Wristwatches and smartwatches',
 TRUE, FALSE, NULL, NULL, NULL, NULL,
 '["item_name","manufacturer_id","model","serial_number","receipt_image","front_image","back_image","serial_image"]', 18),

-- Documents
((SELECT id FROM categories WHERE name = 'documents'), 'national_id', 'National ID', '🪪', 'National identification documents',
 FALSE, TRUE, 'ID Number', 'Enter National ID number', NULL, NULL,
 '["item_name","full_name","id_number","date_of_birth","id_front_image","id_back_image"]', 19),
((SELECT id FROM categories WHERE name = 'documents'), 'passport', 'Passport', '🛂', 'International travel passports',
 FALSE, TRUE, 'Passport Number', 'Enter Passport number', '^[A-Z0-9]{6,12}$', 'Passport number must be 6-12 characters',
 '["item_name","full_name","passport_number","date_of_birth","issuing_country","expiry_date","passport_photo_image","passport_id_image"]', 20);

-- =============================================
-- 13. SEED DATA - MANUFACTURERS (Complete)
-- =============================================
INSERT INTO manufacturers (name, display_name, logo_url, website, is_active) VALUES
-- Electronics
('Apple', 'Apple Inc.', NULL, 'https://www.apple.com', TRUE),
('Samsung', 'Samsung Electronics', NULL, 'https://www.samsung.com', TRUE),
('Google', 'Google LLC', NULL, 'https://www.google.com', TRUE),
('Microsoft', 'Microsoft Corporation', NULL, 'https://www.microsoft.com', TRUE),
('Dell', 'Dell Technologies', NULL, 'https://www.dell.com', TRUE),
('HP', 'HP Inc.', NULL, 'https://www.hp.com', TRUE),
('Lenovo', 'Lenovo Group', NULL, 'https://www.lenovo.com', TRUE),
('Asus', 'ASUS', NULL, 'https://www.asus.com', TRUE),
('Acer', 'Acer Inc.', NULL, 'https://www.acer.com', TRUE),
('Sony', 'Sony Corporation', NULL, 'https://www.sony.com', TRUE),
('LG', 'LG Electronics', NULL, 'https://www.lg.com', TRUE),
('Panasonic', 'Panasonic Corporation', NULL, 'https://www.panasonic.com', TRUE),
('Canon', 'Canon Inc.', NULL, 'https://www.usa.canon.com', TRUE),
('Nikon', 'Nikon Corporation', NULL, 'https://www.nikon.com', TRUE),
('Seagate', 'Seagate Technology', NULL, 'https://www.seagate.com', TRUE),
('Western Digital', 'Western Digital', NULL, 'https://www.westerndigital.com', TRUE),
('Linksys', 'Linksys', NULL, 'https://www.linksys.com', TRUE),
('TP-Link', 'TP-Link', NULL, 'https://www.tp-link.com', TRUE),
('Netgear', 'Netgear', NULL, 'https://www.netgear.com', TRUE),
('JBL', 'JBL', NULL, 'https://www.jbl.com', TRUE),
('Bose', 'Bose Corporation', NULL, 'https://www.bose.com', TRUE),
('Xiaomi', 'Xiaomi Corporation', NULL, 'https://www.mi.com', TRUE),
('Oppo', 'Oppo Mobile', NULL, 'https://www.oppo.com', TRUE),
('Vivo', 'Vivo Communication Technology', NULL, 'https://www.vivo.com', TRUE),
('Honor', 'Honor Device Co.', NULL, 'https://www.honor.com', TRUE),
('Nothing', 'Nothing Technology', NULL, 'https://www.nothing.tech', TRUE),
('Realme', 'Realme Mobile', NULL, 'https://www.realme.com', TRUE),
('Motorola', 'Motorola Mobility', NULL, 'https://www.motorola.com', TRUE),
('OnePlus', 'OnePlus Technology', NULL, 'https://www.oneplus.com', TRUE),
('HTC', 'HTC Corporation', NULL, 'https://www.htc.com', TRUE),
('Infinix', 'Infinix Mobile', NULL, 'https://www.infinixmobility.com', TRUE),
('Tecno', 'Tecno Mobile', NULL, 'https://www.tecno-mobile.com', TRUE),
-- Vehicles
('Toyota', 'Toyota Motor Corporation', NULL, 'https://www.toyota.com', TRUE),
('Honda', 'Honda Motor Co.', NULL, 'https://www.honda.com', TRUE),
('Ford', 'Ford Motor Company', NULL, 'https://www.ford.com', TRUE),
('BMW', 'BMW Group', NULL, 'https://www.bmw.com', TRUE),
('Mercedes', 'Mercedes-Benz', NULL, 'https://www.mercedes.com', TRUE),
('Tesla', 'Tesla Inc.', NULL, 'https://www.tesla.com', TRUE),
('Volkswagen', 'Volkswagen Group', NULL, 'https://www.vw.com', TRUE),
('Nissan', 'Nissan Motor Co.', NULL, 'https://www.nissan.com', TRUE),
('Hyundai', 'Hyundai Motor Company', NULL, 'https://www.hyundai.com', TRUE),
('Kia', 'Kia Corporation', NULL, 'https://www.kia.com', TRUE),
-- Bicycles
('Trek', 'Trek Bicycle Corporation', NULL, 'https://www.trekbikes.com', TRUE),
('Giant', 'Giant Manufacturing Co.', NULL, 'https://www.giant-bicycles.com', TRUE),
('Specialized', 'Specialized Bicycle Components', NULL, 'https://www.specialized.com', TRUE),
('Cannondale', 'Cannondale Bicycle Corporation', NULL, 'https://www.cannondale.com', TRUE),
('Santa Cruz', 'Santa Cruz Bicycles', NULL, 'https://www.santacruzbicycles.com', TRUE),
('Scott', 'Scott Sports', NULL, 'https://www.scott-sports.com', TRUE),
('Cube', 'Cube Bikes', NULL, 'https://www.cube.eu', TRUE),
('Merida', 'Merida Bikes', NULL, 'https://www.merida-bikes.com', TRUE),
('Bianchi', 'Bianchi Bicycles', NULL, 'https://www.bianchi.com', TRUE),
('GT', 'GT Bicycles', NULL, 'https://www.gtbicycles.com', TRUE),
('Fuji', 'Fuji Bikes', NULL, 'https://www.fujibikes.com', TRUE),
('Norco', 'Norco Bicycles', NULL, 'https://www.norco.com', TRUE),
('Kona', 'Kona Bicycles', NULL, 'https://www.konabikes.com', TRUE),
('Surly', 'Surly Bikes', NULL, 'https://surlybikes.com', TRUE),
('Rad Power', 'Rad Power Bikes', NULL, 'https://www.radpowerbikes.com', TRUE),
('Ancheer', 'Ancheer Electric Bikes', NULL, 'https://www.ancheer.com', TRUE),
('Bosch', 'Bosch eBike Systems', NULL, 'https://www.bosch-ebike.com', TRUE),
('Yamaha', 'Yamaha eBikes', NULL, 'https://www.yamaha.com', TRUE),
('Shimano', 'Shimano Bicycle Components', NULL, 'https://www.shimano.com', TRUE),
('Sram', 'SRAM', NULL, 'https://www.sram.com', TRUE),
('Raleigh', 'Raleigh Bicycle Company', NULL, 'https://www.raleigh.com', TRUE),
('Schwinn', 'Schwinn Bicycles', NULL, 'https://www.schwinn.com', TRUE),
('Huffy', 'Huffy Corporation', NULL, 'https://www.huffy.com', TRUE),
('Mongoose', 'Mongoose Bicycles', NULL, 'https://www.mongoose.com', TRUE),
-- Watches
('Fossil', 'Fossil Group', NULL, 'https://www.fossil.com', TRUE),
('Garmin', 'Garmin', NULL, 'https://www.garmin.com', TRUE),
('Citizen', 'Citizen Watch', NULL, 'https://www.citizenwatch.com', TRUE),
('Seiko', 'Seiko Watch Corporation', NULL, 'https://www.seikowatches.com', TRUE),
('Casio', 'Casio America', NULL, 'https://www.casio.com', TRUE),
('Omega', 'Omega SA', NULL, 'https://www.omegawatches.com', TRUE),
('Rolex', 'Rolex SA', NULL, 'https://www.rolex.com', TRUE),
('Tag Heuer', 'TAG Heuer', NULL, 'https://www.tagheuer.com', TRUE);

-- =============================================
-- 14. SEED DATA - DEVICE MODELS (Phones)
-- =============================================
-- Apple iPhone Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 17 Pro Max', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 17 Pro', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 17 Air', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 17e', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 16 Pro Max', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 16 Pro', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 16 Plus', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 16e', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 15 Pro Max', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 15 Pro', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 15 Plus', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 15', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 14 Pro Max', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 14 Pro', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 14 Plus', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 14', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 13 Pro Max', 'Smartphone', 'Phone', 2022, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 13 Pro', 'Smartphone', 'Phone', 2022, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 13', 'Smartphone', 'Phone', 2022, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 13 Mini', 'Smartphone', 'Phone', 2022, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 12 Pro Max', 'Smartphone', 'Phone', 2021, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 12 Pro', 'Smartphone', 'Phone', 2021, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 12', 'Smartphone', 'Phone', 2021, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 12 Mini', 'Smartphone', 'Phone', 2021, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 11 Pro Max', 'Smartphone', 'Phone', 2020, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 11 Pro', 'Smartphone', 'Phone', 2020, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone 11', 'Smartphone', 'Phone', 2020, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone SE 3rd Gen', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone SE 2nd Gen', 'Smartphone', 'Phone', 2020, 2023, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone XS Max', 'Smartphone', 'Phone', 2019, 2022, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone XS', 'Smartphone', 'Phone', 2019, 2022, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone XR', 'Smartphone', 'Phone', 2019, 2022, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPhone X', 'Smartphone', 'Phone', 2018, 2021, TRUE);

-- Samsung Galaxy Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S26 Ultra', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S26+', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S26', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S25 Ultra', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S25+', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S25', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S25 FE', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S24 Ultra', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S24+', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S24', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S24 FE', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S23 Ultra', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S23+', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S23', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S22 Ultra', 'Smartphone', 'Phone', 2022, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S22+', 'Smartphone', 'Phone', 2022, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S22', 'Smartphone', 'Phone', 2022, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S21 Ultra', 'Smartphone', 'Phone', 2021, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S21+', 'Smartphone', 'Phone', 2021, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S21', 'Smartphone', 'Phone', 2021, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy S21 FE', 'Smartphone', 'Phone', 2021, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Z Fold8 Ultra', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Z Fold7', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Z Fold6', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Z Fold5', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Z Flip8', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Z Flip7', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Z Flip6', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Z Flip5', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy A57 5G', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy A56', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy A55', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy A54', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy M56', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy M55', 'Smartphone', 'Phone', 2024, NULL, TRUE);

-- Google Pixel Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 10 Pro Fold', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 10 Pro XL', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 10 Pro', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 10', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 10a', 'Smartphone', 'Phone', 2026, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 9 Pro Fold', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 9 Pro XL', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 9 Pro', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 9', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 8 Pro', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 8', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 7 Pro', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel 7', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel Fold', 'Smartphone', 'Phone', 2023, NULL, TRUE);

-- OnePlus Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'OnePlus'), 'OnePlus 13s', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'OnePlus'), 'OnePlus 12', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'OnePlus'), 'OnePlus 11', 'Smartphone', 'Phone', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'OnePlus'), 'OnePlus 10 Pro', 'Smartphone', 'Phone', 2022, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'OnePlus'), 'OnePlus Nord 6', 'Smartphone', 'Phone', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'OnePlus'), 'OnePlus Nord 4', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'OnePlus'), 'OnePlus Nord CE4', 'Smartphone', 'Phone', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'OnePlus'), 'OnePlus Nord CE3', 'Smartphone', 'Phone', 2022, NULL, TRUE);

-- =============================================
-- 15. SEED DATA - DEVICE MODELS (Laptops)
-- =============================================
-- Apple MacBook Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'MacBook Pro 16" M4 Max', 'Laptop', 'Laptop', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'MacBook Pro 16" M4 Pro', 'Laptop', 'Laptop', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'MacBook Pro 14" M4 Max', 'Laptop', 'Laptop', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'MacBook Pro 14" M4 Pro', 'Laptop', 'Laptop', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'MacBook Pro 16" M3 Max', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'MacBook Pro 14" M3 Max', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'MacBook Air 15" M4', 'Laptop', 'Laptop', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'MacBook Air 13" M4', 'Laptop', 'Laptop', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'MacBook Air 15" M3', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'MacBook Air 13" M3', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'MacBook Air 13" M2', 'Laptop', 'Laptop', 2022, NULL, TRUE);

-- Dell Laptop Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Dell'), 'Dell XPS 16', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Dell'), 'Dell XPS 14', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Dell'), 'Dell XPS 13', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Dell'), 'Dell XPS 15', 'Laptop', 'Laptop', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Dell'), 'Dell Latitude 9450', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Dell'), 'Dell Latitude 7450', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Dell'), 'Dell Inspiron 16 Plus', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Dell'), 'Alienware m18 R2', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Dell'), 'Alienware m16 R2', 'Laptop', 'Laptop', 2024, NULL, TRUE);

-- HP Laptop Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'HP'), 'HP Spectre x360 16', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'HP'), 'HP Spectre x360 14', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'HP'), 'HP Envy 16', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'HP'), 'HP Envy 15', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'HP'), 'HP Pavilion Plus 16', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'HP'), 'HP Pavilion Plus 14', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'HP'), 'HP Omen Transcend 16', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'HP'), 'HP EliteBook 1040 G11', 'Laptop', 'Laptop', 2024, NULL, TRUE);

-- Lenovo Laptop Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Lenovo'), 'ThinkPad X1 Carbon Gen 12', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Lenovo'), 'ThinkPad X1 Carbon Gen 11', 'Laptop', 'Laptop', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Lenovo'), 'ThinkPad T14 Gen 5', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Lenovo'), 'ThinkPad T16 Gen 3', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Lenovo'), 'Lenovo Yoga 9i Gen 9', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Lenovo'), 'Lenovo Yoga 7i 16', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Lenovo'), 'Lenovo Legion 9i', 'Laptop', 'Laptop', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Lenovo'), 'Lenovo Legion Pro 7i', 'Laptop', 'Laptop', 2024, NULL, TRUE);

-- =============================================
-- 16. SEED DATA - DEVICE MODELS (Tablets)
-- =============================================
-- Apple iPad Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPad Pro 13" M4', 'Tablet', 'Tablet', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPad Pro 11" M4', 'Tablet', 'Tablet', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPad Pro 12.9" M2', 'Tablet', 'Tablet', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPad Air 13" M2', 'Tablet', 'Tablet', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPad Air 11" M2', 'Tablet', 'Tablet', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPad 10th Gen', 'Tablet', 'Tablet', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'iPad Mini 7', 'Tablet', 'Tablet', 2024, NULL, TRUE);

-- Samsung Galaxy Tab Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Tab S10 Ultra', 'Tablet', 'Tablet', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Tab S10+', 'Tablet', 'Tablet', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Tab S10', 'Tablet', 'Tablet', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Tab S9 Ultra', 'Tablet', 'Tablet', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Tab S9+', 'Tablet', 'Tablet', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Tab S9', 'Tablet', 'Tablet', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Tab A9+', 'Tablet', 'Tablet', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Tab A9', 'Tablet', 'Tablet', 2024, NULL, TRUE);

-- Lenovo Tablet Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Lenovo'), 'Lenovo Tab P12', 'Tablet', 'Tablet', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Lenovo'), 'Lenovo Tab P11 Gen 2', 'Tablet', 'Tablet', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Lenovo'), 'Lenovo Yoga Tab 13', 'Tablet', 'Tablet', 2023, NULL, TRUE);

-- Google Pixel Tab Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel Tablet 2', 'Tablet', 'Tablet', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Google'), 'Pixel Tablet', 'Tablet', 'Tablet', 2023, NULL, TRUE);

-- =============================================
-- 17. SEED DATA - VEHICLE MODELS
-- =============================================
-- Toyota Vehicle Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Toyota'), 'Camry', 'Sedan', 'Car', 1982, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Toyota'), 'Corolla', 'Sedan', 'Car', 1966, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Toyota'), 'RAV4', 'SUV', 'Car', 1994, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Toyota'), 'Highlander', 'SUV', 'Car', 2000, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Toyota'), '4Runner', 'SUV', 'Car', 1984, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Toyota'), 'Land Cruiser', 'SUV', 'Car', 1951, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Toyota'), 'Tacoma', 'Pickup', 'Truck', 1995, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Toyota'), 'Tundra', 'Pickup', 'Truck', 1999, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Toyota'), 'Sienna', 'Minivan', 'Van', 1997, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Toyota'), 'Prius', 'Hybrid', 'Car', 1997, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Toyota'), 'Hiace', 'Van', 'Van', 1967, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Toyota'), 'Coaster', 'Bus', 'Bus', 1969, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Toyota'), 'Supra', 'Sports Car', 'Car', 1978, NULL, TRUE);

-- Honda Vehicle Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Honda'), 'Accord', 'Sedan', 'Car', 1976, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Honda'), 'Civic', 'Sedan', 'Car', 1972, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Honda'), 'CR-V', 'SUV', 'Car', 1995, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Honda'), 'Pilot', 'SUV', 'Car', 2002, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Honda'), 'Passport', 'SUV', 'Car', 1993, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Honda'), 'Ridgeline', 'Pickup', 'Truck', 2005, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Honda'), 'Odyssey', 'Minivan', 'Van', 1994, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Honda'), 'Civic Type R', 'Sports Car', 'Car', 1997, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Honda'), 'NSX', 'Sports Car', 'Car', 1990, NULL, TRUE);

-- Ford Vehicle Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Ford'), 'F-150', 'Pickup', 'Truck', 1948, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Ford'), 'F-250', 'Pickup', 'Truck', 1953, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Ford'), 'Ranger', 'Pickup', 'Truck', 1983, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Ford'), 'Maverick', 'Pickup', 'Truck', 2021, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Ford'), 'Mustang', 'Sports Car', 'Car', 1964, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Ford'), 'Mustang Mach-E', 'SUV', 'Car', 2020, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Ford'), 'Escape', 'SUV', 'Car', 2000, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Ford'), 'Bronco', 'SUV', 'Car', 1965, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Ford'), 'Explorer', 'SUV', 'Car', 1990, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Ford'), 'Expedition', 'SUV', 'Car', 1996, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Ford'), 'Transit', 'Van', 'Van', 1965, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Ford'), 'F-650', 'Truck', 'Truck', 2000, NULL, TRUE);

-- BMW Vehicle Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'BMW'), '1 Series', 'Hatchback', 'Car', 2004, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'BMW'), '2 Series', 'Coupe', 'Car', 2014, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'BMW'), '3 Series', 'Sedan', 'Car', 1975, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'BMW'), '4 Series', 'Coupe', 'Car', 2013, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'BMW'), '5 Series', 'Sedan', 'Car', 1972, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'BMW'), '7 Series', 'Sedan', 'Car', 1977, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'BMW'), 'X1', 'SUV', 'Car', 2009, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'BMW'), 'X3', 'SUV', 'Car', 2003, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'BMW'), 'X5', 'SUV', 'Car', 1999, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'BMW'), 'i4', 'Electric', 'Car', 2021, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'BMW'), 'i7', 'Electric', 'Car', 2022, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'BMW'), 'M3', 'Sports Car', 'Car', 1986, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'BMW'), 'M4', 'Sports Car', 'Car', 2014, NULL, TRUE);

-- Mercedes-Benz Vehicle Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Mercedes'), 'A-Class', 'Hatchback', 'Car', 1997, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Mercedes'), 'C-Class', 'Sedan', 'Car', 1993, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Mercedes'), 'E-Class', 'Sedan', 'Car', 1993, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Mercedes'), 'S-Class', 'Sedan', 'Car', 1972, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Mercedes'), 'GLA', 'SUV', 'Car', 2013, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Mercedes'), 'GLC', 'SUV', 'Car', 2015, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Mercedes'), 'GLE', 'SUV', 'Car', 2015, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Mercedes'), 'GLS', 'SUV', 'Car', 2015, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Mercedes'), 'G-Class', 'SUV', 'Car', 1979, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Mercedes'), 'EQS', 'Electric Sedan', 'Car', 2021, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Mercedes'), 'Sprinter', 'Van', 'Van', 1995, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Mercedes'), 'AMG GT', 'Sports Car', 'Car', 2014, NULL, TRUE);

-- Tesla Vehicle Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Tesla'), 'Model S', 'Sedan', 'Car', 2012, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Tesla'), 'Model 3', 'Sedan', 'Car', 2017, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Tesla'), 'Model X', 'SUV', 'Car', 2015, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Tesla'), 'Model Y', 'SUV', 'Car', 2020, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Tesla'), 'Cybertruck', 'Pickup', 'Truck', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Tesla'), 'Semi', 'Truck', 'Truck', 2022, NULL, TRUE);

-- Volkswagen Vehicle Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Volkswagen'), 'Golf', 'Hatchback', 'Car', 1974, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Volkswagen'), 'Jetta', 'Sedan', 'Car', 1979, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Volkswagen'), 'Passat', 'Sedan', 'Car', 1973, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Volkswagen'), 'Tiguan', 'SUV', 'Car', 2007, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Volkswagen'), 'Atlas', 'SUV', 'Car', 2017, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Volkswagen'), 'ID.4', 'Electric SUV', 'Car', 2020, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Volkswagen'), 'ID.Buzz', 'Electric Van', 'Van', 2022, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Volkswagen'), 'Golf GTI', 'Sports Car', 'Car', 1976, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Volkswagen'), 'Transporter', 'Van', 'Van', 1950, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Volkswagen'), 'Amarok', 'Pickup', 'Truck', 2010, NULL, TRUE);

-- Nissan Vehicle Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Nissan'), 'Altima', 'Sedan', 'Car', 1992, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Nissan'), 'Sentra', 'Sedan', 'Car', 1982, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Nissan'), 'Rogue', 'SUV', 'Car', 2007, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Nissan'), 'Pathfinder', 'SUV', 'Car', 1985, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Nissan'), 'Frontier', 'Pickup', 'Truck', 1997, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Nissan'), 'Ariya', 'Electric SUV', 'Car', 2021, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Nissan'), 'GT-R', 'Sports Car', 'Car', 2007, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Nissan'), 'Leaf', 'Electric', 'Car', 2010, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Nissan'), 'NV200', 'Van', 'Van', 2009, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Nissan'), 'Urvan', 'Van', 'Van', 1973, NULL, TRUE);

-- =============================================
-- 18. SEED DATA - BICYCLE MODELS
-- =============================================
-- Trek Bicycle Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Trek'), 'Trek FX 3 Disc', 'Hybrid', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Trek'), 'Trek FX 2', 'Hybrid', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Trek'), 'Trek Domane SL 7', 'Road Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Trek'), 'Trek Domane SL 5', 'Road Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Trek'), 'Trek Madone SLR 9', 'Road Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Trek'), 'Trek Emonda SLR 9', 'Road Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Trek'), 'Trek Fuel EX 9.8', 'Mountain Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Trek'), 'Trek Fuel EX 8', 'Mountain Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Trek'), 'Trek Remedy 9.8', 'Mountain Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Trek'), 'Trek Slash 9.9', 'Mountain Bike', 'Bicycle', 2024, NULL, TRUE);

-- Giant Bicycle Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Giant'), 'Giant Escape 3', 'Hybrid', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Giant'), 'Giant Escape 2', 'Hybrid', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Giant'), 'Giant Defy Advanced 2', 'Road Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Giant'), 'Giant Defy Advanced 1', 'Road Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Giant'), 'Giant TCR Advanced SL', 'Road Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Giant'), 'Giant Trance Advanced Pro', 'Mountain Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Giant'), 'Giant Trance X Advanced', 'Mountain Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Giant'), 'Giant Reign Advanced', 'Mountain Bike', 'Bicycle', 2024, NULL, TRUE);

-- Specialized Bicycle Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Specialized'), 'Specialized Sirrus 3.0', 'Hybrid', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Specialized'), 'Specialized Sirrus X 3.0', 'Hybrid', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Specialized'), 'Specialized Roubaix SL8', 'Road Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Specialized'), 'Specialized Tarmac SL8', 'Road Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Specialized'), 'Specialized Stumpjumper Pro', 'Mountain Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Specialized'), 'Specialized Stumpjumper Evo', 'Mountain Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Specialized'), 'Specialized Enduro Pro', 'Mountain Bike', 'Bicycle', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Specialized'), 'Specialized Turbo Vado', 'Electric Bike', 'Bicycle', 2024, NULL, TRUE);

-- =============================================
-- 19. SEED DATA - WATCH MODELS
-- =============================================
-- Apple Watch Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'Apple Watch Ultra 3', 'Smartwatch', 'Watch', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'Apple Watch Ultra 2', 'Smartwatch', 'Watch', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'Apple Watch Series 10', 'Smartwatch', 'Watch', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'Apple Watch Series 9', 'Smartwatch', 'Watch', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Apple'), 'Apple Watch SE 2', 'Smartwatch', 'Watch', 2023, NULL, TRUE);

-- Samsung Watch Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Watch 7 Ultra', 'Smartwatch', 'Watch', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Watch 7', 'Smartwatch', 'Watch', 2025, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Watch 6 Classic', 'Smartwatch', 'Watch', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Watch 6', 'Smartwatch', 'Watch', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Samsung'), 'Galaxy Watch 5 Pro', 'Smartwatch', 'Watch', 2023, NULL, TRUE);

-- Garmin Watch Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Garmin'), 'Garmin Fenix 8', 'Smartwatch', 'Watch', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Garmin'), 'Garmin Fenix 7X Pro', 'Smartwatch', 'Watch', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Garmin'), 'Garmin Forerunner 965', 'Smartwatch', 'Watch', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Garmin'), 'Garmin Forerunner 265', 'Smartwatch', 'Watch', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Garmin'), 'Garmin Venu 4', 'Smartwatch', 'Watch', 2024, NULL, TRUE);

-- Fossil Watch Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Fossil'), 'Fossil Gen 7', 'Smartwatch', 'Watch', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Fossil'), 'Fossil Gen 6', 'Smartwatch', 'Watch', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Fossil'), 'Fossil Garrett', 'Smartwatch', 'Watch', 2024, NULL, TRUE);

-- =============================================
-- 20. SEED DATA - SPEAKER MODELS
-- =============================================
-- JBL Speaker Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'JBL'), 'JBL Charge 6', 'Speaker', 'Speaker', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'JBL'), 'JBL Charge 5', 'Speaker', 'Speaker', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'JBL'), 'JBL Flip 7', 'Speaker', 'Speaker', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'JBL'), 'JBL Flip 6', 'Speaker', 'Speaker', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'JBL'), 'JBL Xtreme 4', 'Speaker', 'Speaker', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'JBL'), 'JBL Xtreme 3', 'Speaker', 'Speaker', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'JBL'), 'JBL Boombox 3', 'Speaker', 'Speaker', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'JBL'), 'JBL PartyBox 310', 'Speaker', 'Speaker', 2023, NULL, TRUE);

-- Bose Speaker Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Bose'), 'Bose SoundLink Flex', 'Speaker', 'Speaker', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Bose'), 'Bose SoundLink Revolve+', 'Speaker', 'Speaker', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Bose'), 'Bose Portable Smart Speaker', 'Speaker', 'Speaker', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Bose'), 'Bose Home Speaker 500', 'Speaker', 'Speaker', 2023, NULL, TRUE);

-- Sony Speaker Models
INSERT INTO device_models (manufacturer_id, model_name, model_type, category, year_start, year_end, is_active) VALUES
((SELECT id FROM manufacturers WHERE name = 'Sony'), 'Sony SRS-XG300', 'Speaker', 'Speaker', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Sony'), 'Sony SRS-XE300', 'Speaker', 'Speaker', 2023, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Sony'), 'Sony SRS-XB100', 'Speaker', 'Speaker', 2024, NULL, TRUE),
((SELECT id FROM manufacturers WHERE name = 'Sony'), 'Sony SRS-RA5000', 'Speaker', 'Speaker', 2023, NULL, TRUE);

-- =============================================
-- 21. DEVICE TYPE MANUFACTURERS MAPPING
-- =============================================
INSERT INTO device_type_manufacturers (device_type_id, manufacturer_id)
SELECT 
    dt.id,
    m.id
FROM device_types dt
CROSS JOIN manufacturers m
WHERE 
    (dt.name = 'phone' AND m.name IN ('Apple', 'Samsung', 'Google', 'Sony', 'LG', 'Microsoft', 'Xiaomi', 'Oppo', 'Vivo', 'Honor', 'Nothing', 'Realme', 'Motorola', 'OnePlus', 'HTC', 'Infinix', 'Tecno'))
    OR (dt.name = 'laptop' AND m.name IN ('Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Microsoft', 'Samsung'))
    OR (dt.name = 'tablet' AND m.name IN ('Apple', 'Samsung', 'Google', 'Lenovo', 'Microsoft', 'Xiaomi'))
    OR (dt.name = 'tv' AND m.name IN ('Samsung', 'Sony', 'LG', 'Panasonic'))
    OR (dt.name = 'camera' AND m.name IN ('Canon', 'Nikon', 'Sony', 'Panasonic'))
    OR (dt.name = 'scanner' AND m.name IN ('Canon', 'HP', 'Epson'))
    OR (dt.name = 'printer' AND m.name IN ('HP', 'Canon', 'Epson', 'Brother', 'Samsung'))
    OR (dt.name = 'projector' AND m.name IN ('Sony', 'Panasonic', 'LG'))
    OR (dt.name = 'hard_drive' AND m.name IN ('Seagate', 'Western Digital', 'Samsung', 'Sony'))
    OR (dt.name = 'router' AND m.name IN ('Linksys', 'TP-Link', 'Netgear', 'Asus'))
    OR (dt.name = 'solar_box' AND m.name IN ('Panasonic', 'LG', 'Tesla'))
    OR (dt.name IN ('car', 'motorcycle', 'truck', 'van', 'bus') AND m.name IN ('Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Tesla', 'Volkswagen', 'Nissan', 'Hyundai', 'Kia'))
    OR (dt.name = 'bicycle' AND m.name IN ('Trek', 'Giant', 'Specialized', 'Cannondale', 'Santa Cruz', 'Scott', 'Cube', 'Merida', 'Bianchi', 'GT', 'Fuji', 'Norco', 'Kona', 'Surly', 'Rad Power', 'Ancheer', 'Bosch', 'Yamaha', 'Shimano', 'Sram', 'Raleigh', 'Schwinn', 'Huffy', 'Mongoose'))
    OR (dt.name = 'speaker' AND m.name IN ('JBL', 'Bose', 'Sony', 'Samsung'))
    OR (dt.name = 'watch' AND m.name IN ('Apple', 'Samsung', 'Fossil', 'Garmin', 'Citizen', 'Seiko', 'Casio', 'Omega', 'Rolex', 'Tag Heuer'))
    OR (dt.name IN ('national_id', 'passport') AND m.name = '');

-- =============================================
-- SINGLE TABLE: found_items
-- Complete Unified Schema for Found Items
-- =============================================
CREATE TABLE found_items (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Reporter Information
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reporter_name VARCHAR(255) NOT NULL,
    reporter_email VARCHAR(255),
    reporter_phone VARCHAR(20),
    -- Item Information (Required Fields)
    item_name VARCHAR(255) NOT NULL,
    item_category VARCHAR(50) NOT NULL,
    item_description TEXT,
    -- Identifiers (Conditional by Category)
    serial_number VARCHAR(100),
    imei_number VARCHAR(15),
    vin_number VARCHAR(17),
    passport_number VARCHAR(20),
    id_number VARCHAR(100),
    license_plate VARCHAR(20),
    frame_size VARCHAR(20),
    -- Physical Attributes
    condition VARCHAR(50),
    color VARCHAR(50),
    brand VARCHAR(100),
    model VARCHAR(100),
    distinctive_marks TEXT,
    additional_notes TEXT,
    -- Found Location
    found_location TEXT NOT NULL,
    found_latitude DECIMAL(10,8),
    found_longitude DECIMAL(11,8),
    found_address TEXT,
    found_city VARCHAR(100),
    found_district VARCHAR(100),
    found_sector VARCHAR(100),
    found_country VARCHAR(100),
    -- Found Date & Time
    found_date DATE NOT NULL,
    found_time TIME,
    found_datetime TIMESTAMP,
    -- Verification Code (Auto-generated)
    found_verification_code VARCHAR(19) UNIQUE NOT NULL,
    found_verification_hash VARCHAR(255) UNIQUE NOT NULL,
    qr_code_url VARCHAR(500),
    -- Images (All Required)
    overall_image_url VARCHAR(500) NOT NULL,
    overall_image_file_name VARCHAR(255) NOT NULL,
    serial_image_url VARCHAR(500) NOT NULL,
    serial_image_file_name VARCHAR(255) NOT NULL,
    front_image_url VARCHAR(500),
    front_image_file_name VARCHAR(255),
    back_image_url VARCHAR(500),
    back_image_file_name VARCHAR(255),
    side_image_url VARCHAR(500),
    side_image_file_name VARCHAR(255),
    interior_image_url VARCHAR(500),
    interior_image_file_name VARCHAR(255),
    damage_image_url VARCHAR(500),
    damage_image_file_name VARCHAR(255),
    distinctive_image_url VARCHAR(500),
    distinctive_image_file_name VARCHAR(255),
    -- Status Tracking
    status VARCHAR(30) DEFAULT 'pending',
    -- Match Information
    matched_item_id UUID REFERENCES registered_items(id),
    matched_by UUID REFERENCES users(id),
    matched_at TIMESTAMP,
    match_confidence_score DECIMAL(5,2),
    -- Claim Information
    claimed_by UUID REFERENCES users(id),
    claimed_at TIMESTAMP,
    claim_status VARCHAR(30),
    claim_notes TEXT,
    claim_proof_details TEXT,
    -- Return Information
    returned_to UUID REFERENCES users(id),
    returned_at TIMESTAMP,
    return_notes TEXT,
    -- Expiry Information
    expires_at TIMESTAMP,
    is_expired BOOLEAN DEFAULT FALSE,
    -- Security & Privacy
    is_public BOOLEAN DEFAULT TRUE,
    show_reporter_contact BOOLEAN DEFAULT FALSE,
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('pending', 'matched', 'claimed', 'returned', 'resolved', 'expired')),
    CONSTRAINT valid_claim_status CHECK (claim_status IN ('pending_review', 'approved', 'rejected', 'awaiting_return', 'completed')),
    CONSTRAINT valid_condition CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor', 'Damaged'))
);

-- =============================================
-- INDEXES
-- =============================================

-- Primary Indexes
CREATE INDEX idx_found_items_reporter ON found_items(reporter_id);
CREATE INDEX idx_found_items_status ON found_items(status);
CREATE INDEX idx_found_items_category ON found_items(item_category);

-- Identifier Indexes
CREATE INDEX idx_found_items_serial ON found_items(serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX idx_found_items_imei ON found_items(imei_number) WHERE imei_number IS NOT NULL;
CREATE INDEX idx_found_items_vin ON found_items(vin_number) WHERE vin_number IS NOT NULL;
CREATE INDEX idx_found_items_passport ON found_items(passport_number) WHERE passport_number IS NOT NULL;
CREATE INDEX idx_found_items_id ON found_items(id_number) WHERE id_number IS NOT NULL;
CREATE INDEX idx_found_items_plate ON found_items(license_plate) WHERE license_plate IS NOT NULL;

-- Location Indexes
CREATE INDEX idx_found_items_location ON found_items(found_latitude, found_longitude);
CREATE INDEX idx_found_items_city ON found_items(found_city);
CREATE INDEX idx_found_items_country ON found_items(found_country);

-- Date Indexes
CREATE INDEX idx_found_items_date ON found_items(found_date);
CREATE INDEX idx_found_items_created ON found_items(created_at DESC);
CREATE INDEX idx_found_items_expires ON found_items(expires_at) WHERE expires_at IS NOT NULL;

-- Match Indexes
CREATE INDEX idx_found_items_matched ON found_items(matched_item_id) WHERE matched_item_id IS NOT NULL;

-- Verification Code Index
CREATE INDEX idx_found_items_verification ON found_items(found_verification_code);

-- Claim Indexes
CREATE INDEX idx_found_items_claimed_by ON found_items(claimed_by) WHERE claimed_by IS NOT NULL;
CREATE INDEX idx_found_items_claim_status ON found_items(claim_status) WHERE claim_status IS NOT NULL;