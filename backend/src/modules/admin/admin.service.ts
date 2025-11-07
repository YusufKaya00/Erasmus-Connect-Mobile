import { prisma } from '@shared/config/database';
import { User, UserRole } from '@prisma/client';
import { getSupabaseClient } from '@shared/config/supabase';
import profileService from '../profile/profile.service.supabase';

// Cache for stats (10 minutes)
let statsCache: any = null;
let cacheExpiry: number = 0;

// Cache for routes (2 minutes)
let routesCache: any = null;
let routesCacheExpiry: number = 0;

export class AdminService {
  async getUsers(page: number = 1, limit: number = 10, search: string = '') {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          email: { contains: search, mode: 'insensitive' as const }
        }
      : {};

    // Fetch user information with counts from MongoDB
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      where,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            routes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch profile information from Supabase and routes count
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        try {
          const [supabaseProfile, routesCount] = await Promise.all([
            profileService.getProfileByUserId(user.id),
            prisma.route.count({ where: { userId: user.id } })
          ]);
          
          return {
            ...user,
            profile: supabaseProfile || null, // Profile information from Supabase
            _count: {
              ...user._count,
              routes: routesCount
            }
          };
        } catch (error) {
          console.error(`Failed to fetch data for user ${user.id}:`, error);
          return {
            ...user,
            profile: null, // null if cannot be fetched from Supabase
            _count: {
              ...user._count,
              routes: 0
            }
          };
        }
      })
    );

    const totalUsers = await prisma.user.count({ where });

    return {
      data: enrichedUsers,
      meta: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    };
  }

  async getUserById(userId: string) {
    // Fetch basic user information from MongoDB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
        posts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            createdAt: true,
            isPublished: true,
          },
        },
        comments: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Fetch profile information from Supabase
    try {
      const supabaseProfile = await profileService.getProfileByUserId(userId);
      return {
        ...user,
        profile: supabaseProfile || null,
      };
    } catch (error) {
      console.error(`Failed to fetch Supabase profile for user ${userId}:`, error);
      return {
        ...user,
        profile: null,
      };
    }
  }

  async updateUser(userId: string, data: { 
    email?: string; 
    password?: string; 
    role?: UserRole; 
    isActive?: boolean; 
    isVerified?: boolean 
  }): Promise<User> {
    // Update only in MongoDB (login credentials, roles, system data)
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async updateUserProfile(userId: string, profileData: any) {
    // Update profile information in Supabase
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to update profile in Supabase: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating profile in Supabase:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<User> {
    // Delete only from MongoDB (login credentials, roles, system data)
    // Profile information will remain in Supabase
    return prisma.user.delete({
      where: { id: userId },
    });
  }

  async deleteUserProfile(userId: string) {
    // Delete profile information from Supabase
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete profile from Supabase: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting profile from Supabase:', error);
      throw error;
    }
  }

  async deleteUserCompletely(userId: string) {
    // Completely delete user from both MongoDB and Supabase
    const results = {
      mongoDeleted: false,
      supabaseDeleted: false,
      errors: [] as string[]
    };

    try {
      // First delete from MongoDB
      try {
        await prisma.user.delete({
          where: { id: userId },
        });
        results.mongoDeleted = true;
        console.log(`User ${userId} deleted from MongoDB successfully`);
      } catch (mongoError: any) {
        const errorMsg = `Failed to delete user from MongoDB: ${mongoError.message}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Then delete from Supabase
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('user_id', userId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }
        
        results.supabaseDeleted = true;
        console.log(`User ${userId} deleted from Supabase successfully`);
      } catch (supabaseError: any) {
        const errorMsg = `Failed to delete user from Supabase: ${supabaseError.message}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }

      return {
        success: results.mongoDeleted && results.supabaseDeleted,
        message: results.mongoDeleted && results.supabaseDeleted 
          ? 'User deleted successfully from both databases'
          : 'User deletion completed with some errors',
        details: results
      };

    } catch (error: any) {
      console.error('Error in deleteUserCompletely:', error);
      throw new Error(`Failed to delete user completely: ${error.message}`);
    }
  }

  // ============================================
  // TRAVEL ROUTES METHODS
  // ============================================

  async getTravelRoutes(page: number = 1, limit: number = 10, search: string = '') {
    try {
      // Cache kontrolü (sadece arama yoksa)
      if (!search) {
        const now = Date.now();
        const cacheKey = `routes_${page}_${limit}`;
        
        if (routesCache && routesCache.key === cacheKey && now < routesCacheExpiry) {
          return routesCache.data;
        }
      }

      const skip = (page - 1) * limit;
      
      // Basit where clause - sadece title'da arama
      const whereClause = search ? {
        title: { contains: search, mode: 'insensitive' }
      } : {};

      // Tek query ile her şeyi çek - join kullan
      const [routes, total] = await Promise.all([
        prisma.route.findMany({
          where: whereClause,
          select: {
            id: true,
            title: true,
            description: true,
            startLocation: true,
            endLocation: true,
            startCoordinates: true,
            endCoordinates: true,
            viewCount: true,
            likeCount: true,
            isPublic: true,
            createdAt: true,
            userId: true,
            user: {
              select: {
                id: true,
                email: true,
              }
            },
            _count: {
              select: {
                comments: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.route.count({ where: whereClause })
      ]);

      const result = {
        success: true,
        data: routes,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };

      // Cache'e kaydet (sadece arama yoksa)
      if (!search) {
        const now = Date.now();
        routesCache = {
          key: `routes_${page}_${limit}`,
          data: result
        };
        routesCacheExpiry = now + (2 * 60 * 1000); // 2 dakika
      }

      return result;
    } catch (error: any) {
      console.error('Error fetching travel routes:', error);
      // Hata durumunda boş array döndür
      return {
        success: true,
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      };
    }
  }

  async getTravelRouteById(id: string) {
    try {
      const route = await prisma.route.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  photoUrl: true,
                }
              }
            }
          },
          _count: {
            select: {
              comments: true,
            }
          }
        }
      });

      if (!route) {
        throw new Error('Travel route not found');
      }

      return {
        success: true,
        data: route
      };
    } catch (error: any) {
      console.error('Error fetching travel route:', error);
      throw new Error(`Failed to fetch travel route: ${error.message}`);
    }
  }

  async deleteTravelRoute(id: string) {
    try {
      // First check if route exists
      const route = await prisma.route.findUnique({
        where: { id }
      });

      if (!route) {
        return {
          success: false,
          message: 'Travel route not found'
        };
      }

      // Delete the route
      await prisma.route.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Travel route deleted successfully'
      };
    } catch (error: any) {
      console.error('Error deleting travel route:', error);
      return {
        success: false,
        message: `Failed to delete travel route: ${error.message}`
      };
    }
  }

  // ============================================
  // STATS METHODS
  // ============================================

  async getOverallStats() {
    try {
      // Check cache first
      const now = Date.now();
      if (statsCache && now < cacheExpiry) {
        return {
          success: true,
          data: statsCache
        };
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

      // Cache the results for 10 minutes
      statsCache = stats;
      cacheExpiry = now + (10 * 60 * 1000); // 10 minutes

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error fetching overall stats:', error);
      // Return default values in case of error
      return {
        success: true,
        data: {
          totalUsers: 0,
          totalPosts: 0,
          totalComments: 0,
          totalCategories: 0,
          totalCountries: 0,
          activeUsers: 0,
          publishedPosts: 0,
        }
      };
    }
  }
}
