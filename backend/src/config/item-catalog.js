/**
 * Item types offered by the registration form
 * (frontend/app/dashboard/register-item/page.js → DEVICE_TYPE_FORMS).
 *
 * When the form names one of these types and the database does not have it
 * yet, registration creates it from this list instead of failing with
 * "Device type not found". Definitions match scripts/seed-catalog.js and the
 * sync-*-catalog.js scripts. Keep this list in sync when adding a form type.
 */
const CATEGORIES = {
  electronics: { display_name: 'Electronics', icon: '📱', description: 'Electronic devices and gadgets', display_order: 1 },
  vehicles: { display_name: 'Vehicles', icon: '🚗', description: 'Motor vehicles and bicycles', display_order: 2 },
  audio: { display_name: 'Audio', icon: '🔊', description: 'Audio equipment and speakers', display_order: 3 },
  accessories: { display_name: 'Accessories', icon: '⌚', description: 'Watches and personal accessories', display_order: 4 },
  documents: { display_name: 'Documents', icon: '📄', description: 'Important identification documents', display_order: 5 }
};

// [category, name, display name, icon, required fields]
const ITEM_TYPES = [
  ['electronics', 'phone', 'Phone', '📱', ['imei_number', 'model']],
  ['electronics', 'laptop', 'Laptop', '💻', ['serial_number', 'model']],
  ['electronics', 'tablet', 'Tablet', '📱', ['imei_number', 'serial_number']],
  ['electronics', 'camera', 'Camera', '📷', ['serial_number', 'model']],
  ['electronics', 'tv', 'TV', '📺', ['serial_number', 'model']],
  ['electronics', 'printer', 'Printer', '🖨️', ['serial_number', 'model']],
  ['electronics', 'router', 'Router', '📡', ['serial_number']],
  ['electronics', 'hard_drive', 'Hard Drive', '💾', ['serial_number', 'model']],
  ['electronics', 'projector', 'Projector', '📽️', ['serial_number', 'model']],
  ['electronics', 'solar_box', 'Solar Box', '☀️', ['serial_number', 'model']],
  ['vehicles', 'car', 'Car', '🚗', ['vin_number', 'license_plate']],
  ['vehicles', 'motorcycle', 'Motorcycle', '🏍️', ['vin_number', 'license_plate']],
  ['vehicles', 'bicycle', 'Bicycle', '🚲', ['serial_number', 'frame_size']],
  ['vehicles', 'truck', 'Truck', '🚚', ['vin_number', 'license_plate']],
  ['vehicles', 'van', 'Van', '🚐', ['vin_number', 'license_plate']],
  ['audio', 'speaker', 'Speaker', '🔊', ['serial_number']],
  ['accessories', 'watch', 'Watch', '⏰', ['serial_number']],
  ['documents', 'passport', 'Passport', '📕', ['passport_number']],
  ['documents', 'national_id', 'National ID', '🪪', ['id_number']]
];

const ITEM_TYPES_BY_NAME = new Map(ITEM_TYPES.map(([category, name, display_name, icon, required_fields], index) => [
  name,
  { category, name, display_name, icon, required_fields, display_order: index + 1 }
]));

module.exports = { CATEGORIES, ITEM_TYPES, ITEM_TYPES_BY_NAME };
