import Redis from 'ioredis';
import logger from '@utils/logger';

export const createRedisClient = () => {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    // Upstash için TLS eklendi
    tls: process.env.REDIS_HOST?.includes('upstash.io') 
      ? {} 
      : undefined,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redis.on('error', (error) => {
    logger.error('❌ Redis error:', error);
  });

  return redis;
};

export const redis = createRedisClient();