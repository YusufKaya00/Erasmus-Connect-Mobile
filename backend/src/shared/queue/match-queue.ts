import Bull from 'bull';
import { matchService } from '@modules/match/match.service';
import { prisma } from '@shared/config/database';
import logger from '@utils/logger';

export const matchQueue = new Bull('match-queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
});

// Process match calculation jobs
matchQueue.process('calculate-matches', async (job) => {
  const { userId } = job.data;
  
  logger.info(`Processing match calculation for user ${userId}`);

  try {
    const matches = await matchService.calculateMatches(userId);
    await matchService.saveMatches(userId, matches);

    // Send notification if new matches found
    if (matches.length > 0) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'MATCH_FOUND',
          title: 'Yeni Eşleşmeler Bulundu!',
          message: `${matches.length} yeni eşleşme önerisi mevcut.`,
        },
      });
    }

    logger.info(`Completed match calculation for user ${userId}: ${matches.length} matches`);

    return { success: true, matchCount: matches.length };
  } catch (error) {
    logger.error(`Error calculating matches for user ${userId}:`, error);
    throw error;
  }
});

// Process bulk match calculation (nightly job)
matchQueue.process('calculate-all-matches', async (job) => {
  logger.info('Processing bulk match calculation');

  try {
    const activeUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        profile: {
          profileVisibility: { in: ['PUBLIC', 'MATCHES_ONLY'] },
        },
      },
      select: { id: true },
    });

    let processed = 0;
    let failed = 0;

    for (const user of activeUsers) {
      try {
        const matches = await matchService.calculateMatches(user.id);
        await matchService.saveMatches(user.id, matches);
        processed++;

        // Rate limit to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logger.error(`Error processing user ${user.id}:`, error);
        failed++;
      }
    }

    logger.info(`Bulk match calculation complete: ${processed} processed, ${failed} failed`);

    return { success: true, processed, failed };
  } catch (error) {
    logger.error('Error in bulk match calculation:', error);
    throw error;
  }
});

// Queue event listeners
matchQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed:`, result);
});

matchQueue.on('failed', (job, error) => {
  logger.error(`Job ${job?.id} failed:`, error);
});

// Helper function to add match calculation job
export const triggerMatchCalculation = async (userId: string) => {
  await matchQueue.add('calculate-matches', { userId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

  logger.info(`Queued match calculation for user ${userId}`);
};

// Schedule nightly bulk calculation
export const scheduleBulkMatchCalculation = async () => {
  await matchQueue.add('calculate-all-matches', {}, {
    repeat: {
      cron: '0 3 * * *', // Every day at 3 AM
    },
  });

  logger.info('Scheduled nightly bulk match calculation');
};

