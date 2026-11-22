const { Op } = require('sequelize');
const { sequelize } = require('../src/config/database');
const { User, DeviceType, RegisteredItem, FoundItem } = require('../src/models');

const imageUrl = 'http://localhost:5000/uploads/overall_image-1788720364437-539466623.png';

const electronics = [
  ['smartphone', 'Smartphone', 'Samsung Galaxy'],
  ['laptop', 'Laptop', 'Dell'],
  ['tablet', 'Tablet', 'iPad'],
  ['camera', 'Camera', 'Canon'],
  ['desktop_computer', 'Desktop Computer', 'HP Pavilion'],
  ['smart_tv', 'Smart TV', 'Samsung'],
  ['gaming_console', 'Gaming Console', 'PlayStation 5'],
  ['printer', 'Printer', 'Epson EcoTank'],
  ['monitor', 'Monitor', 'LG UltraGear'],
  ['router', 'Router', 'TP-Link'],
];

const vehicles = [
  ['car', 'Car', 'Toyota Corolla'],
  ['motorcycle', 'Motorcycle', 'Yamaha'],
  ['bicycle', 'Bicycle', 'Trek'],
  ['bus', 'Bus', 'Toyota Coaster'],
  ['truck', 'Truck', 'Isuzu NPR'],
];

const seedCommunityBoard = async () => {
  try {
    await sequelize.authenticate();
    const owner = await User.findOne({ order: [['created_at', 'ASC']] });
    if (!owner) throw new Error('Create a user account before importing community-board items.');

    const types = await DeviceType.findAll();
    const typesByName = new Map(types.map((type) => [type.name, type]));
    const records = [
      ...electronics.map(([typeName, itemName, model]) => ({ typeName, itemName, model, category: 'electronics' })),
      ...vehicles.map(([typeName, itemName, model]) => ({ typeName, itemName, model, category: 'vehicles' })),
    ];

    if (process.argv.includes('--replace')) {
      await FoundItem.destroy({ where: { found_verification_code: { [Op.like]: 'FND-SEED-%' } }, force: true });
      await RegisteredItem.destroy({ where: { verification_code: { [Op.like]: 'LST-SEED-%' } }, force: true });
    }

    for (const [index, record] of records.entries()) {
      const { typeName, itemName, model } = record;
      const deviceType = typesByName.get(typeName);
      if (!deviceType) throw new Error(`Device type "${typeName}" is missing. Run npm run seed:catalog first.`);

      const number = String(index + 1).padStart(2, '0');
      const identifiers = record.category === 'vehicles'
        ? { vin_number: `1HGCM82633A${String(100000 + index).slice(-6)}`, license_plate: `RAB ${100 + index} D` }
        : { serial_number: `DEMO-${record.category.toUpperCase()}-${number}`, imei_number: typeName === 'smartphone' ? `35000000000000${number.slice(-1)}` : null };

      await FoundItem.findOrCreate({
        where: { found_verification_code: `FND-SEED-${String(index + 1).padStart(10, '0')}` },
        defaults: {
          reporter_name: 'Community Finder',
          reporter_email: 'finder@example.test',
          item_name: itemName,
          item_category: record.category,
          item_description: `Demo catalog import: found ${model} ${itemName.toLowerCase()} awaiting its owner.`,
          model,
          brand: model.split(' ')[0],
          found_location: 'Kigali Convention Centre',
          found_city: 'Kigali',
          found_district: 'Gasabo',
          found_country: 'Rwanda',
          found_date: '2026-09-15',
          found_verification_code: `FND-SEED-${String(index + 1).padStart(10, '0')}`,
          found_verification_hash: `seed-found-hash-${String(index + 1).padStart(4, '0')}`,
          overall_image_url: imageUrl,
          overall_file_name: 'demo-found-item.png',
          serial_image_url: imageUrl,
          serial_file_name: 'demo-identifier.png',
          status: 'pending',
          is_public: true,
          ...identifiers,
        },
      });

      await RegisteredItem.findOrCreate({
        where: { verification_code: `LST-SEED-${String(index + 1).padStart(10, '0')}` },
        defaults: {
          user_id: owner.id,
          device_type_id: deviceType.id,
          item_name: itemName,
          model,
          receipt_image_url: imageUrl,
          receipt_file_name: 'demo-receipt.png',
          front_image_url: imageUrl,
          front_file_name: 'demo-front.png',
          back_image_url: imageUrl,
          back_file_name: 'demo-back.png',
          serial_image_url: imageUrl,
          serial_file_name: 'demo-identifier.png',
          verification_code: `LST-SEED-${String(index + 1).padStart(10, '0')}`,
          verification_code_hash: `seed-lost-hash-${String(index + 1).padStart(4, '0')}`,
          status: index % 2 ? 'stolen' : 'lost',
          is_public: true,
          notes: `Demo catalog import: ${model} ${itemName.toLowerCase()} reported missing.`,
          ...identifiers,
        },
      });
    }

    console.log('Imported 15 found and 15 lost demo records: 10 Electronics and 5 Vehicles.');
  } catch (error) {
    console.error(`Community-board import failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seedCommunityBoard();
