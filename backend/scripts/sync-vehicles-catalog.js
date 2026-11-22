const { sequelize } = require('../src/config/database');
const Category = require('../src/models/Category');
const DeviceType = require('../src/models/DeviceType');

const vehicles = [
  ['car', 'Car', '🚗', ['vin_number', 'license_plate']],
  ['motorcycle', 'Motorcycle', '🏍️', ['vin_number', 'license_plate']],
  ['bicycle', 'Bicycle', '🚲', ['serial_number', 'frame_size']],
  ['truck', 'Truck', '🚚', ['vin_number', 'license_plate']],
  ['van', 'Van', '🚐', ['vin_number', 'license_plate']]
];

async function syncVehiclesCatalog() {
  await sequelize.authenticate();
  const category = await Category.findOne({ where: { name: 'vehicles' } });
  if (!category) throw new Error('The Vehicles category does not exist. Run the catalog seed first.');

  await sequelize.transaction(async (transaction) => {
    await DeviceType.update({ is_active: false }, { where: { category_id: category.id }, transaction });
    for (const [index, [name, display_name, icon, required_fields]] of vehicles.entries()) {
      const [deviceType] = await DeviceType.findOrCreate({
        where: { name },
        defaults: { category_id: category.id, name, display_name, icon, required_fields, has_serial_number: true, display_order: index + 1, is_active: true },
        transaction
      });
      await deviceType.update({ category_id: category.id, display_name, icon, required_fields, has_serial_number: true, display_order: index + 1, is_active: true }, { transaction });
    }
  });
  console.log('Vehicles catalog synchronized: 5 active item types.');
}

syncVehiclesCatalog()
  .catch((error) => { console.error(`Vehicles catalog sync failed: ${error.message}`); process.exitCode = 1; })
  .finally(() => sequelize.close());
