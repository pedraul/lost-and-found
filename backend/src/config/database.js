const { Sequelize } = require('sequelize');
const env = require('./env');

// Hosted databases (Neon via Vercel, Supabase, …) provide one connection string.
// Locally the individual DB_* settings are used instead.
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || null;
const serverless = Boolean(process.env.VERCEL);
const useSsl = env.db.ssl || /sslmode=require/.test(connectionString || '') || (connectionString && !/localhost|127\.0\.0\.1/.test(connectionString));

const options = {
  dialect: 'postgres',
  // Passed explicitly so Vercel's bundler includes the driver (Sequelize loads it dynamically).
  dialectModule: require('pg'),
  logging: env.nodeEnv === 'development' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  dialectOptions: {
    ssl: useSsl ? { require: true, rejectUnauthorized: false } : false
  },
  // Each serverless instance is short-lived and many may run at once, so keep
  // its pool tiny; Neon's pooled connection string does the real pooling.
  pool: serverless
    ? { max: 2, min: 0, acquire: 20000, idle: 5000, evict: 5000 }
    : { max: 10, min: 0, acquire: 30000, idle: 10000 }
};

const sequelize = connectionString
  ? new Sequelize(connectionString, options)
  : new Sequelize(env.db.name, env.db.user, env.db.password, { ...options, host: env.db.host, port: env.db.port });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
