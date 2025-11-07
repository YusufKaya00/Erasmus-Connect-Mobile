import { prisma } from '@shared/config/database';

// Cache for stats (5 minutes)
let statsCache: any = null;
let cacheExpiry: number = 0;

export class StatsService {
  async getOverallStats() {
    try {
      // Check cache first
      const now = Date.now();
      if (statsCache && now < cacheExpiry) {
        return statsCache;
      }

      // Get basic counts in parallel
      const [
        totalUsers,
        totalPosts,
        totalCategories,
        totalCountries,
        totalComments
      ] = await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.category.count(),
        prisma.country.count(),
        prisma.comment.count()
      ]);
      
      // Get active users (users with recent activity - last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [activeUsers, publishedPosts] = await Promise.all([
        prisma.user.count({
          where: {
            updatedAt: {
              gte: thirtyDaysAgo
            }
          }
        }),
        prisma.post.count({
          where: {
            isPublished: true
          }
        })
      ]);

      const stats = {
        totalUsers,
        totalPosts,
        totalComments,
        totalCategories,
        totalCountries,
        activeUsers,
        publishedPosts,
      };

      // Cache the results for 5 minutes
      statsCache = stats;
      cacheExpiry = now + (5 * 60 * 1000); // 5 minutes

      return stats;
    } catch (error) {
      console.error('Error fetching overall stats:', error);
      // Return default values in case of error
      return {
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        totalCategories: 0,
        totalCountries: 0,
        activeUsers: 0,
        publishedPosts: 0,
      };
    }
  }
}

export const statsService = new StatsService();
