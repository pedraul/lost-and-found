const { sequelize } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

const runSeeds = async () => {
  try {
    console.log('Running seeds...');
    await sequelize.authenticate();
    console.log('Database connection established');

    const schemaPath = path.join(__dirname, '../src/config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await sequelize.query(schema);
    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

runSeeds();