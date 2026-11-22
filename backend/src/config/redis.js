const { createClient } = require('redis');
const env = require('./env');

const redisClient = createClient({
  url: `redis://${env.redis.password ? `:${env.redis.password}@` : ''}${env.redis.host}:${env.redis.port}`
});

let redisConnected = false;

// Only log errors if Redis is successfully connected
redisClient.on('error', (err) => {
  if (redisConnected) {
    console.error('❌ Redis error:', err.message);
  }
});

const connectRedis = async () => {
  try {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis connection timeout')), 2000);
    });

    await Promise.race([redisClient.connect(), timeout]);
    redisConnected = true;
    console.log('✅ Redis connected successfully');
  } catch (error) {
    if (env.nodeEnv === 'production') {
      console.error('❌ Unable to connect to Redis:', error.message);
      process.exit(1);
    }
    // Silently continue in development without logging
  }
};

module.exports = { redisClient, connectRedis };