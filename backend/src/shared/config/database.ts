import { PrismaClient } from '@prisma/client';
import logger from '@utils/logger';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['error', 'warn'] // Query log'ları kaldırdık - performans için
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling ayarları
  __internal: {
    engine: {
      binaryTargets: ['native'],
    },
  },
});

// Connect to database
prisma.$connect()
  .then(() => {
    logger.info('✅ Database connected');
  })
  .catch((error) => {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
});

export { prisma };

