const { sequelize } = require('../src/config/database');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'active'");
    console.log('account_status schema ready');
  } finally {
    await sequelize.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
