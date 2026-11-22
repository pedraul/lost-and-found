const dotenv = require('dotenv');

dotenv.config();

const env = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'lost_found',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true'
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },

  // Storage
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      bucketName: process.env.AWS_BUCKET_NAME,
      endpoint: process.env.AWS_S3_ENDPOINT
    }
  },

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Email (Gmail SMTP with an app password)
  email: {
    user: process.env.EMAIL_USER,
    appPassword: process.env.EMAIL_APP_PASSWORD,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER
  },

  // Payments
  paypack: {
    paymentMode: process.env.PAYMENT_MODE || 'paypack',
    apiBaseUrl: process.env.PAYPACK_API_BASE_URL || 'https://payments.paypack.rw/api',
    clientId: process.env.PAYPACK_CLIENT_ID,
    clientSecret: process.env.PAYPACK_CLIENT_SECRET,
    webhookSecret: process.env.PAYPACK_WEBHOOK_SECRET,
    webhookMode: process.env.PAYPACK_WEBHOOK_MODE || 'production',
    annualAmount: parseInt(process.env.PAYMENT_ANNUAL_AMOUNT_RWF, 10) || 1000,
    annualDurationDays: parseInt(process.env.PAYMENT_ANNUAL_DURATION_DAYS, 10) || 365
  },

  // File Upload
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || '5mb',
    uploadDir: process.env.UPLOAD_DIR || 'uploads'
  }
};

module.exports = env;
