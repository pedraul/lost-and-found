const { sequelize } = require('../src/config/database');
const fs = require('fs');
const path = require('path');
require('../src/models');
const { encryptPayments } = require('./encrypt-payments');

const runMigrations = async () => {
  try {
    console.log('Running migrations...');
    await sequelize.authenticate();
    console.log('Database connection established');

    const migrationsDir = path.join(__dirname, '../database/migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    await sequelize.sync({ force: false, alter: true });
    await sequelize.query(`
      UPDATE users
      SET subscription_trial_started_at = created_at,
          payment_due_at = created_at + INTERVAL '7 days'
      WHERE subscription_trial_started_at IS NULL
        AND EXISTS (
          SELECT 1 FROM registered_items WHERE registered_items.user_id = users.id
        )
    `);
    // Audit-trail schema (FK to SET NULL etc.) that `sync({ alter })` cannot express reliably.
    await sequelize.query(fs.readFileSync(path.join(__dirname, '../../database/migrations/025_expand_activity_logs.sql'), 'utf8'));

    if (process.env.PAYMENT_ENCRYPTION_KEY) {
      await encryptPayments({ exitOnFinish: false });
    } else {
      console.warn('⚠️  PAYMENT_ENCRYPTION_KEY is not set; existing payment rows were left unencrypted.');
    }
    console.log('✅ Database synchronized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigrations();