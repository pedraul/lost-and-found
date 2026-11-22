const app = require('../app');
const env = require('./config/env');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');
const { assertEncryptionConfigured } = require('./utils/encryption');
const { sendPaymentReminders } = require('./services/payment-reminder.service');
const { retryPendingPaymentConfirmations } = require('./services/payment-confirmation.service');

// =====================
// START THE SERVER
// =====================
const startServer = async () => {
  try {
    // Payment transactions are stored AES-256-GCM encrypted; refuse to start
    // with a missing or malformed key rather than failing on the first payment.
    if (env.paypack.paymentMode !== 'mock') assertEncryptionConfigured();

    // Connect to PostgreSQL database
    await connectDB();

    // Connect to Redis (optional in development)
    await connectRedis();

    const server = app.listen(env.port, () => {
      logger.info(`🌐 Server running in ${env.nodeEnv} mode on port ${env.port}`);
      logger.info(`📝 API Documentation available at http://localhost:${env.port}/health`);
    });

    // Check hourly so overdue users receive one reminder without requiring a separate worker.
    sendPaymentReminders().catch((error) => logger.error(`Payment reminder failed: ${error.message}`));
    retryPendingPaymentConfirmations().catch((error) => logger.error(`Payment confirmation retry failed: ${error.message}`));
    const reminderInterval = setInterval(() => {
      sendPaymentReminders().catch((error) => logger.error(`Payment reminder failed: ${error.message}`));
    }, 60 * 60 * 1000);
    const paymentConfirmationInterval = setInterval(() => {
      retryPendingPaymentConfirmations().catch((error) => logger.error(`Payment confirmation retry failed: ${error.message}`));
    }, 60 * 1000);

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(err.message);
      server.close(() => {
        clearInterval(reminderInterval);
        clearInterval(paymentConfirmationInterval);
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      logger.error(err.message);
      process.exit(1);
    });

    // Graceful shutdown on SIGTERM/SIGINT
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM received, shutting down gracefully');
      server.close(() => {
        clearInterval(reminderInterval);
        clearInterval(paymentConfirmationInterval);
        logger.info('💤 Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('👋 SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('💤 Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
