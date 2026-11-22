-- =============================================
-- SEED: device-types.sql
-- =============================================

-- Electronics Category
INSERT INTO device_types (category_id, name, display_name, icon, description, has_serial_number, required_fields, display_order, is_active) 
SELECT c.id, 'smartphone', 'Smartphone', '📱', 'Mobile phones and smartphones', TRUE, '["imei_number", "model"]'::jsonb, 1, TRUE FROM categories c WHERE c.name = 'electronics'
UNION ALL
SELECT c.id, 'laptop', 'Laptop', '💻', 'Laptops and notebooks', TRUE, '["serial_number", "model"]'::jsonb, 2, TRUE FROM categories c WHERE c.name = 'electronics'
UNION ALL
SELECT c.id, 'tablet', 'Tablet', '📱', 'Tablets and iPad devices', TRUE, '["imei_number", "serial_number"]'::jsonb, 3, TRUE FROM categories c WHERE c.name = 'electronics'
UNION ALL
SELECT c.id, 'camera', 'Camera', '📷', 'Digital cameras and video cameras', TRUE, '["serial_number", "model"]'::jsonb, 4, TRUE FROM categories c WHERE c.name = 'electronics'

-- Accessories Category
UNION ALL
SELECT c.id, 'smartwatch', 'Smartwatch', '⌚', 'Smartwatches and wearables', TRUE, '["serial_number", "imei_number"]'::jsonb, 5, TRUE FROM categories c WHERE c.name = 'accessories'
UNION ALL
SELECT c.id, 'watch', 'Watch', '⏰', 'Wrist watches and timepieces', TRUE, '["serial_number"]'::jsonb, 6, TRUE FROM categories c WHERE c.name = 'accessories'

-- Audio Category
UNION ALL
SELECT c.id, 'headphones', 'Headphones', '🎧', 'Headphones and earbuds', TRUE, '["serial_number"]'::jsonb, 7, TRUE FROM categories c WHERE c.name = 'audio'
UNION ALL
SELECT c.id, 'speaker', 'Speaker', '🔊', 'Bluetooth and audio speakers', TRUE, '["serial_number"]'::jsonb, 8, TRUE FROM categories c WHERE c.name = 'audio'

-- Vehicles Category
UNION ALL
SELECT c.id, 'car', 'Car', '🚗', 'Passenger vehicles and automobiles', TRUE, '["vin_number", "license_plate"]'::jsonb, 9, TRUE FROM categories c WHERE c.name = 'vehicles'
UNION ALL
SELECT c.id, 'motorcycle', 'Motorcycle', '🏍️', 'Motorcycles and motorbikes', TRUE, '["vin_number", "license_plate"]'::jsonb, 10, TRUE FROM categories c WHERE c.name = 'vehicles'
UNION ALL
SELECT c.id, 'bicycle', 'Bicycle', '🚴', 'Bicycles and e-bikes', TRUE, '["serial_number", "frame_size"]'::jsonb, 11, TRUE FROM categories c WHERE c.name = 'vehicles'

-- Documents Category
UNION ALL
SELECT c.id, 'passport', 'Passport', '📕', 'Passports and travel documents', TRUE, '["passport_number"]'::jsonb, 12, TRUE FROM categories c WHERE c.name = 'documents'
UNION ALL
SELECT c.id, 'id_card', 'ID Card', '🪪', 'National ID cards and driver licenses', TRUE, '["id_number"]'::jsonb, 13, TRUE FROM categories c WHERE c.name = 'documents';
