const { sequelize } = require('../src/config/database');
const Category = require('../src/models/Category');
const DeviceType = require('../src/models/DeviceType');

const categories = [
  { name: 'electronics', display_name: 'Electronics', icon: '📱', description: 'Electronic devices and gadgets', display_order: 1 },
  { name: 'vehicles', display_name: 'Vehicles', icon: '🚗', description: 'Motor vehicles and bicycles', display_order: 2 },
  { name: 'audio', display_name: 'Audio', icon: '🔊', description: 'Audio equipment and speakers', display_order: 3 },
  { name: 'accessories', display_name: 'Accessories', icon: '⌚', description: 'Watches and personal accessories', display_order: 4 },
  { name: 'documents', display_name: 'Documents', icon: '📄', description: 'Important identification documents', display_order: 5 }
];

const itemTypes = [
  ['electronics', 'smartphone', 'Smartphone', '📱', ['imei_number', 'model']],
  ['electronics', 'laptop', 'Laptop', '💻', ['serial_number', 'model']],
  ['electronics', 'tablet', 'Tablet', '📱', ['imei_number', 'serial_number']],
  ['electronics', 'camera', 'Camera', '📷', ['serial_number', 'model']],
  ['accessories', 'smartwatch', 'Smartwatch', '⌚', ['serial_number', 'imei_number']],
  ['accessories', 'watch', 'Watch', '⏰', ['serial_number']],
  ['audio', 'headphones', 'Headphones', '🎧', ['serial_number']],
  ['audio', 'speaker', 'Speaker', '🔊', ['serial_number']],
  ['vehicles', 'car', 'Car', '🚗', ['vin_number', 'license_plate']],
  ['vehicles', 'motorcycle', 'Motorcycle', '🏍️', ['vin_number', 'license_plate']],
  ['vehicles', 'bicycle', 'Bicycle', '🚴', ['serial_number', 'frame_size']],
  ['documents', 'passport', 'Passport', '📕', ['passport_number']],
  ['documents', 'id_card', 'ID Card', '🪪', ['id_number']],
  // The registration form offers "National ID" (frontend DEVICE_TYPE_FORMS.national_id).
  ['documents', 'national_id', 'National ID', '🪪', ['id_number']]
  , ['electronics', 'desktop_computer', 'Desktop Computer', 'Computer', ['serial_number', 'model']],
  ['electronics', 'smart_tv', 'Smart TV', 'TV', ['serial_number', 'model']],
  ['electronics', 'gaming_console', 'Gaming Console', 'Game', ['serial_number', 'model']],
  ['electronics', 'printer', 'Printer', 'Print', ['serial_number', 'model']],
  ['electronics', 'monitor', 'Monitor', 'Display', ['serial_number', 'model']],
  ['electronics', 'router', 'Router', 'Network', ['serial_number']],
  ['vehicles', 'bus', 'Bus', 'Bus', ['vin_number', 'license_plate']],
  ['vehicles', 'truck', 'Truck', 'Truck', ['vin_number', 'license_plate']],
];

const seedCatalog = async () => {
  try {
    await sequelize.authenticate();

    const categoriesByName = {};
    for (const category of categories) {
      const [record, created] = await Category.findOrCreate({ where: { name: category.name }, defaults: category });
      categoriesByName[category.name] = record;
      console.log(`${created ? 'Added' : 'Kept'} category: ${category.display_name}`);
    }

    for (const [categoryName, name, displayName, icon, requiredFields] of itemTypes) {
      const [, created] = await DeviceType.findOrCreate({
        where: { name },
        defaults: {
          category_id: categoriesByName[categoryName].id,
          name,
          display_name: displayName,
          icon,
          description: displayName,
          has_serial_number: true,
          required_fields: requiredFields,
          display_order: itemTypes.findIndex((item) => item[1] === name) + 1,
          is_active: true
        }
      });
      console.log(`${created ? 'Added' : 'Kept'} item type: ${displayName}`);
    }
  } catch (error) {
    console.error(`Catalog seeding failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seedCatalog();
