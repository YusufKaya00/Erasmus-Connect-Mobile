import { getSupabaseClient } from '@shared/config/supabase';
import { redis } from '@shared/config/redis';
import logger from '@shared/utils/logger';

const supabase = getSupabaseClient();

// Cache configuration
const CACHE_TTL = 3600; // 1 hour in seconds
const CACHE_PREFIX = 'likes';

export interface Like {
  id: string;
  likerId: string;
  likedId: string;
  category: 'ROOMMATE' | 'MENTOR' | 'COMMUNICATION';
  createdAt: string;
}

export class LikeService {
  // ============================================
  // CACHE HELPERS
  // ============================================
  
  private getCacheKey(userId: string, type: 'given' | 'received', category?: string): string {
    return category 
      ? `${CACHE_PREFIX}:${userId}:${type}:${category}`
      : `${CACHE_PREFIX}:${userId}:${type}:all`;
  }

  private getLikeCheckCacheKey(likerId: string, likedId: string, category: string): string {
    return `${CACHE_PREFIX}:check:${likerId}:${likedId}:${category}`;
  }

  private async getFromCache<T>(cacheKey: string): Promise<T | null> {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info(`✅ Cache hit: ${cacheKey}`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      logger.error(`❌ Cache get error for key ${cacheKey}:`, error);
      return null;
    }
  }

  private async setCache(cacheKey: string, data: any): Promise<void> {
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
      logger.info(`💾 Cache set: ${cacheKey}`);
    } catch (error) {
      logger.error(`❌ Cache set error for key ${cacheKey}:`, error);
    }
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    try {
      const patterns = [
        `${CACHE_PREFIX}:${userId}:*`,
        `${CACHE_PREFIX}:check:${userId}:*`,
        `${CACHE_PREFIX}:check:*:${userId}:*`
      ];
      
      let totalKeys = 0;
      for (const pattern of patterns) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
          totalKeys += keys.length;
        }
      }
      
      logger.info(`🗑️  Invalidated ${totalKeys} cache keys for user ${userId}`);
    } catch (error) {
      logger.error(`❌ Cache invalidation error for user ${userId}:`, error);
    }
  }

  // Public method for cache invalidation (called externally if needed)
  async invalidateCache(userId: string): Promise<void> {
    await this.invalidateUserCache(userId);
  }
  // ============================================
  // LIKE USER
  // ============================================
  
  async likeUser(
    likerId: string, 
    likedId: string, 
    category: 'ROOMMATE' | 'MENTOR' | 'COMMUNICATION'
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Check cache first
      const cacheKey = this.getLikeCheckCacheKey(likerId, likedId, category);
      const cachedResult = await this.getFromCache<boolean>(cacheKey);
      
      if (cachedResult === true) {
        return { success: false, message: 'Already liked this user' };
      }

      // Check database if not in cache
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('liker_id', likerId)
        .eq('liked_id', likedId)
        .eq('category', category)
        .single();

      if (existingLike) {
        // Cache the result for next time
        await this.setCache(cacheKey, true);
        return { success: false, message: 'Already liked this user' };
      }

      // Record the like
      const { error: likeError } = await supabase
        .from('likes')
        .insert({
          liker_id: likerId,
          liked_id: likedId,
          category
        });

      if (likeError) {
        logger.error('❌ Error recording like:', likeError);
        return { success: false, message: 'Failed to like user' };
      }

      // Cache the like status
      await this.setCache(cacheKey, true);

      // Invalidate cache for both users
      await this.invalidateUserCache(likerId);
      await this.invalidateUserCache(likedId);

      logger.info(`💖 User ${likerId} liked user ${likedId} in category ${category}`);
      return { success: true, message: 'User liked successfully' };
    } catch (error) {
      logger.error('❌ Error in likeUser:', error);
      return { success: false, message: 'An error occurred' };
    }
  }

  // ============================================
  // UNLIKE USER
  // ============================================
  
  async unlikeUser(
    likerId: string, 
    likedId: string, 
    category: 'ROOMMATE' | 'MENTOR' | 'COMMUNICATION'
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const { error: unlikeError } = await supabase
        .from('likes')
        .delete()
        .eq('liker_id', likerId)
        .eq('liked_id', likedId)
        .eq('category', category);

      if (unlikeError) {
        logger.error('❌ Error removing like:', unlikeError);
        return { success: false, message: 'Failed to unlike user' };
      }

      // Invalidate like check cache
      const cacheKey = this.getLikeCheckCacheKey(likerId, likedId, category);
      try {
        await redis.del(cacheKey);
      } catch (cacheError) {
        logger.error('Error deleting cache key:', cacheError);
      }

      // Invalidate cache for both users
      await this.invalidateUserCache(likerId);
      await this.invalidateUserCache(likedId);

      logger.info(`💔 User ${likerId} unliked user ${likedId} in category ${category}`);
      return { success: true, message: 'User unliked successfully' };
    } catch (error) {
      logger.error('❌ Error in unlikeUser:', error);
      return { success: false, message: 'An error occurred' };
    }
  }

  // ============================================
  // GET USER LIKES
  // ============================================
  
  async getUserLikes(
    userId: string, 
    category?: 'ROOMMATE' | 'MENTOR' | 'COMMUNICATION'
  ): Promise<Like[]> {
    try {
      // Try to get from cache first
      const cacheKey = this.getCacheKey(userId, 'given', category);
      const cached = await this.getFromCache<Like[]>(cacheKey);
      
      if (cached) {
        logger.info(`📦 Returning ${cached.length} cached likes for user ${userId}`);
        return cached;
      }

      logger.info(`🔍 Fetching likes from database for user: ${userId}`);
      
      // Build query
      let query = supabase
        .from('likes')
        .select('*')
        .eq('liker_id', userId)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data: likes, error } = await query;

      if (error) {
        logger.error('❌ Error fetching user likes:', error);
        return [];
      }

      logger.info(`✅ Found ${likes?.length || 0} likes in database`);
      
      // Fetch profile details for each liked user
      if (likes && likes.length > 0) {
        const likedUserIds = likes.map(like => like.liked_id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', likedUserIds);

        if (profileError) {
          logger.error('❌ Error fetching profiles:', profileError);
        } else {
          // Merge profiles with likes
          const likesWithProfiles = likes.map(like => ({
            ...like,
            liked: profiles?.find(p => p.user_id === like.liked_id)
          }));
          
          // Cache the results
          await this.setCache(cacheKey, likesWithProfiles);
          
          logger.info(`✅ Returning ${likesWithProfiles.length} likes with profiles`);
          return likesWithProfiles;
        }
      }

      // Cache empty results too
      await this.setCache(cacheKey, likes || []);
      
      return likes || [];
    } catch (error) {
      logger.error('❌ Error in getUserLikes:', error);
      return [];
    }
  }

  // ============================================
  // GET LIKED BY USERS
  // ============================================
  
  async getLikedByUsers(
    userId: string, 
    category?: 'ROOMMATE' | 'MENTOR' | 'COMMUNICATION'
  ): Promise<Like[]> {
    try {
      // Try to get from cache first
      const cacheKey = this.getCacheKey(userId, 'received', category);
      const cached = await this.getFromCache<Like[]>(cacheKey);
      
      if (cached) {
        logger.info(`📦 Returning ${cached.length} cached "liked by" for user ${userId}`);
        return cached;
      }

      logger.info(`🔍 Fetching "liked by" from database for user: ${userId}`);

      let query = supabase
        .from('likes')
        .select(`
          *,
          liker:profiles!likes_liker_id_fkey(*)
        `)
        .eq('liked_id', userId);

      if (category) {
        query = query.eq('category', category);
      }

      const { data: likes, error } = await query.order('created_at', { ascending: false });

      if (error) {
        logger.error('❌ Error fetching liked by users:', error);
        return [];
      }

      logger.info(`✅ Found ${likes?.length || 0} "liked by" users in database`);

      // Cache the results
      await this.setCache(cacheKey, likes || []);

      return likes || [];
    } catch (error) {
      logger.error('❌ Error in getLikedByUsers:', error);
      return [];
    }
  }

  // ============================================
  // CHECK IF LIKED
  // ============================================
  
  async isLiked(
    likerId: string, 
    likedId: string, 
    category: 'ROOMMATE' | 'MENTOR' | 'COMMUNICATION'
  ): Promise<boolean> {
    try {
      // Check cache first (very fast O(1) operation)
      const cacheKey = this.getLikeCheckCacheKey(likerId, likedId, category);
      const cachedResult = await this.getFromCache<boolean>(cacheKey);
      
      if (cachedResult !== null) {
        logger.info(`⚡ Cache hit for like check: ${likerId} -> ${likedId}`);
        return cachedResult;
      }

      logger.info(`🔍 Checking like status in database: ${likerId} -> ${likedId}`);

      const { data: like } = await supabase
        .from('likes')
        .select('id')
        .eq('liker_id', likerId)
        .eq('liked_id', likedId)
        .eq('category', category)
        .single();

      const isLiked = !!like;

      // Cache the result for next time
      await this.setCache(cacheKey, isLiked);

      return isLiked;
    } catch (error) {
      logger.error('❌ Error checking if liked:', error);
      return false;
    }
  }
}

export const likeService = new LikeService();
