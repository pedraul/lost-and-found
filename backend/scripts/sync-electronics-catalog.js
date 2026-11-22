const { sequelize } = require('../src/config/database');
const Category = require('../src/models/Category');
const DeviceType = require('../src/models/DeviceType');

const electronics = [
  ['phone', 'Phone', '📱', ['imei_number', 'model']],
  ['laptop', 'Laptop', '💻', ['serial_number', 'model']],
  ['tablet', 'Tablet', '📱', ['imei_number', 'serial_number']],
  ['camera', 'Camera', '📷', ['serial_number', 'model']],
  ['tv', 'TV', '📺', ['serial_number', 'model']],
  ['printer', 'Printer', '🖨️', ['serial_number', 'model']],
  ['router', 'Router', '📡', ['serial_number']],
  ['hard_drive', 'Hard Drive', '💾', ['serial_number', 'model']],
  ['projector', 'Projector', '📽️', ['serial_number', 'model']],
  ['solar_box', 'Solar Box', '☀️', ['serial_number', 'model']]
];

async function syncElectronicsCatalog() {
  await sequelize.authenticate();
  const category = await Category.findOne({ where: { name: 'electronics' } });
  if (!category) throw new Error('The Electronics category does not exist. Run the catalog seed first.');

  await sequelize.transaction(async (transaction) => {
    await DeviceType.update(
      { is_active: false },
      { where: { category_id: category.id }, transaction }
    );

    for (const [index, [name, display_name, icon, required_fields]] of electronics.entries()) {
      const [deviceType] = await DeviceType.findOrCreate({
        where: { name },
        defaults: { category_id: category.id, name, display_name, icon, required_fields, has_serial_number: true, display_order: index + 1, is_active: true },
        transaction
      });
      await deviceType.update({ category_id: category.id, display_name, icon, required_fields, has_serial_number: true, display_order: index + 1, is_active: true }, { transaction });
    }
  });

  console.log('Electronics catalog synchronized: 10 active item types.');
}

syncElectronicsCatalog()
  .catch((error) => { console.error(`Electronics catalog sync failed: ${error.message}`); process.exitCode = 1; })
  .finally(() => sequelize.close());
