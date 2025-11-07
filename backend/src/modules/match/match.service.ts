import { getSupabaseClient } from '@/shared/config/supabase';
import { redis } from '@/shared/config/redis';
import { triggerMatchCalculation } from '@/shared/queue/match-queue';
import logger from '@shared/utils/logger';

const supabase = getSupabaseClient();

// Minimum match threshold
const MIN_MATCH_THRESHOLD = 40;

// Cache configuration
const CACHE_TTL = 3600; // 1 hour in seconds
const CACHE_PREFIX = 'matches';

export enum MatchCategory {
  ROOMMATE = 'ROOMMATE',
  MENTOR = 'MENTOR',
  COMMUNICATION = 'COMMUNICATION',
}

interface MatchCandidate {
  userId: string;
  profile: any;
  matchScore: number;
  scoreBreakdown: Record<string, number>;
  category: MatchCategory;
}

export class MatchService {
  
  // ============================================
  // CACHE HELPERS
  // ============================================
  
  private getCacheKey(userId: string, category?: MatchCategory): string {
    return category 
      ? `${CACHE_PREFIX}:${userId}:${category}`
      : `${CACHE_PREFIX}:${userId}:all`;
  }

  private async getFromCache<T>(cacheKey: string): Promise<T | null> {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for key: ${cacheKey}`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${cacheKey}:`, error);
      return null;
    }
  }

  private async setCache(cacheKey: string, data: any): Promise<void> {
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
      logger.info(`Cache set for key: ${cacheKey}`);
    } catch (error) {
      logger.error(`Cache set error for key ${cacheKey}:`, error);
    }
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    try {
      const pattern = `${CACHE_PREFIX}:${userId}:*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`Invalidated ${keys.length} cache keys for user ${userId}`);
      }
    } catch (error) {
      logger.error(`Cache invalidation error for user ${userId}:`, error);
    }
  }

  // Public method for cache invalidation (called when profile is updated)
  async invalidateCache(userId: string): Promise<void> {
    await this.invalidateUserCache(userId);
  }

  // ============================================
  // ROOMMATE MATCHING
  // ============================================
  
  async getRoommateCandidates(userId: string): Promise<MatchCandidate[]> {
    const cacheKey = this.getCacheKey(userId, MatchCategory.ROOMMATE);
    
    // Try to get from cache first
    const cached = await this.getFromCache<MatchCandidate[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get current user's profile
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        match_preferences (*)
      `)
      .eq('user_id', userId)
      .single();

    if (profileError || !currentProfile) {
      logger.error('Error fetching current profile:', profileError);
      return [];
    }

    // Pre-filters for roommate matching
    const { data: candidates, error: candidatesError } = await supabase
      .from('profiles')
      .select(`
        *,
        match_preferences (*)
      `)
      .neq('user_id', userId)
      .eq('destination_country_id', currentProfile.destination_country_id)
      .eq('academic_term', currentProfile.academic_term)
      .eq('looking_for_roommate', true)
      .not('destination_country_id', 'is', null);

    if (candidatesError) {
      logger.error('Error fetching candidates:', candidatesError);
      return [];
    }

    // Calculate match scores
    const matches: MatchCandidate[] = [];
    
    for (const candidate of candidates || []) {
      const score = this.calculateRoommateScore(currentProfile, candidate);
      
      if (score.score >= MIN_MATCH_THRESHOLD) {
        matches.push({
          userId: candidate.user_id,
          profile: candidate,
          matchScore: score.score,
          scoreBreakdown: score.breakdown,
          category: MatchCategory.ROOMMATE,
        });
      }
    }

    // Sort by score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    // Cache the results
    await this.setCache(cacheKey, matches);
    
    logger.info(`Found ${matches.length} roommate matches for user ${userId}`);
    return matches;
  }

  private calculateRoommateScore(
    currentProfile: any,
    candidateProfile: any
  ): { score: number; breakdown: Record<string, number> } {
    const breakdown: Record<string, number> = {};
    
    const currentPrefs = currentProfile.match_preferences;
    const candidatePrefs = candidateProfile.match_preferences;

    // Gender preference match (30 points)
    if (currentPrefs?.preferred_gender) {
      if (candidateProfile.gender === currentPrefs.preferred_gender) {
        breakdown.genderMatch = 30;
      } else {
        breakdown.genderMatch = 0;
      }
    } else {
      breakdown.genderMatch = 30; // No preference = full points
    }

    // Cleanliness match (25 points)
    if (!currentPrefs?.cleanliness) {
      // User doesn't care = full points
      breakdown.cleanliness = 25;
    } else if (!candidatePrefs?.cleanliness) {
      // Candidate didn't specify but user does = medium points
      breakdown.cleanliness = 12;
    } else {
      // Both specified their cleanliness level
      const diff = Math.abs(currentPrefs.cleanliness - candidatePrefs.cleanliness);
      breakdown.cleanliness = Math.max(0, 25 - (diff * 6)); // -6 points per level difference
    }

    // Smoking preference match (25 points)
    if (currentPrefs?.smoking_preference === 'NON_SMOKER_ONLY') {
      if (candidatePrefs?.smoking_preference === 'NON_SMOKER_ONLY') {
        breakdown.smoking = 25;
      } else {
        breakdown.smoking = 0;
      }
    } else {
      breakdown.smoking = 25; // No strong preference
    }

    // Sleep schedule match (20 points)
    if (currentPrefs?.sleep_schedule === 'NO_PREFERENCE' || !currentPrefs?.sleep_schedule) {
      // User doesn't care = full points
      breakdown.sleepSchedule = 20;
    } else if (candidatePrefs?.sleep_schedule === 'NO_PREFERENCE' || !candidatePrefs?.sleep_schedule) {
      // Candidate doesn't care but user does = medium points
      breakdown.sleepSchedule = 15;
    } else {
      // Both have preferences
      if (currentPrefs?.sleep_schedule === candidatePrefs?.sleep_schedule) {
        breakdown.sleepSchedule = 20; // Same schedule
      } else {
        breakdown.sleepSchedule = 5; // Different schedule
      }
    }

    const score = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    return { score, breakdown };
  }

  // ============================================
  // MENTOR MATCHING (Simplified - No Algorithm)
  // ============================================
  
  async getMentorCandidates(userId: string): Promise<MatchCandidate[]> {
    const cacheKey = this.getCacheKey(userId, MatchCategory.MENTOR);
    
    // Skip cache for debugging (temporary)
    // const cached = await this.getFromCache<MatchCandidate[]>(cacheKey);
    // if (cached) {
    //   return cached;
    // }

    // Get current user's profile
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError || !currentProfile) {
      logger.error('Error fetching current profile:', profileError);
      return [];
    }

    logger.info(`🔍 MENTOR - Current user: ${userId}, Country: ${currentProfile.destination_country_id}`);

    // Simple filter: Same country + isMentor = true + has returned
    const { data: candidates, error: candidatesError } = await supabase
      .from('profiles')
      .select(`
        *,
        match_preferences (*)
      `)
      .neq('user_id', userId)
      .eq('destination_country_id', currentProfile.destination_country_id)
      .eq('has_returned_from_erasmus', true)
      .not('destination_country_id', 'is', null);

    if (candidatesError) {
      logger.error('Error fetching mentor candidates:', candidatesError);
      return [];
    }

    logger.info(`🔍 MENTOR - Found ${candidates?.length || 0} candidates with same country & has_returned=true`);

    // Filter only mentors
    const mentors = (candidates || []).filter(candidate => {
      const prefs = candidate.match_preferences;
      const isMentor = prefs?.is_mentor === true;
      
      logger.info(`🔍 MENTOR - ${candidate.first_name}: match_preferences=${!!prefs}, is_mentor=${isMentor}`);
      
      return isMentor;
    });

    logger.info(`✅ MENTOR - Final mentor count: ${mentors.length}`);

    // Convert to match candidates (no scoring)
    const matches: MatchCandidate[] = mentors.map(mentor => ({
      userId: mentor.user_id,
      profile: mentor,
      matchScore: 100, // Fixed score - no algorithm
      scoreBreakdown: { simpleMatch: 100 },
      category: MatchCategory.MENTOR,
    }));
    
    // Cache the results
    await this.setCache(cacheKey, matches);
    
    logger.info(`Found ${matches.length} mentor matches for user ${userId}`);
    return matches;
  }

  // ============================================
  // COMMUNICATION MATCHING (Simplified - No Algorithm)
  // ============================================
  
  async getCommunicationCandidates(userId: string): Promise<MatchCandidate[]> {
    const cacheKey = this.getCacheKey(userId, MatchCategory.COMMUNICATION);
    
    // Try to get from cache first
    const cached = await this.getFromCache<MatchCandidate[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get current user's profile
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError || !currentProfile) {
      logger.error('Error fetching current profile:', profileError);
      return [];
    }

    // Simple filter: Same country + Same academic term
    const { data: candidates, error: candidatesError } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', userId)
      .eq('destination_country_id', currentProfile.destination_country_id)
      .eq('academic_term', currentProfile.academic_term)
      .not('destination_country_id', 'is', null)
      .not('academic_term', 'is', null);

    if (candidatesError) {
      logger.error('Error fetching communication candidates:', candidatesError);
      return [];
    }

    // Convert to match candidates (no scoring)
    const matches: MatchCandidate[] = (candidates || []).map(candidate => ({
      userId: candidate.user_id,
      profile: candidate,
      matchScore: 100, // Fixed score - no algorithm
      scoreBreakdown: { simpleMatch: 100 },
      category: MatchCategory.COMMUNICATION,
    }));
    
    // Cache the results
    await this.setCache(cacheKey, matches);
    
    logger.info(`Found ${matches.length} communication matches for user ${userId}`);
    return matches;
  }

  // ============================================
  // GET ALL MATCHES
  // ============================================
  
  async getAllMatches(userId: string, category?: MatchCategory): Promise<MatchCandidate[]> {
    if (category) {
      switch (category) {
        case MatchCategory.ROOMMATE:
          return this.getRoommateCandidates(userId);
        case MatchCategory.MENTOR:
          return this.getMentorCandidates(userId);
        case MatchCategory.COMMUNICATION:
          return this.getCommunicationCandidates(userId);
        default:
          return [];
      }
    }

    // Check cache for all matches
    const cacheKey = this.getCacheKey(userId);
    const cached = await this.getFromCache<MatchCandidate[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get all categories
    const [roommate, mentor, communication] = await Promise.all([
      this.getRoommateCandidates(userId),
      this.getMentorCandidates(userId),
      this.getCommunicationCandidates(userId),
    ]);

    const allMatches = [...roommate, ...mentor, ...communication];
    
    // Cache all matches
    await this.setCache(cacheKey, allMatches);
    
    return allMatches;
  }

  // ============================================
  // ASYNC MATCH CALCULATION (Queue-based)
  // ============================================
  
  /**
   * Calculate matches for a user (used by queue processor)
   */
  async calculateMatches(userId: string): Promise<MatchCandidate[]> {
    logger.info(`Calculating matches for user ${userId}`);
    
    try {
      const allMatches = await this.getAllMatches(userId);
      
      // Save matches to database (if needed)
      await this.saveMatches(userId, allMatches);
      
      logger.info(`Calculated ${allMatches.length} matches for user ${userId}`);
      return allMatches;
    } catch (error) {
      logger.error(`Error calculating matches for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Save matches to database
   */
  async saveMatches(userId: string, matches: MatchCandidate[]): Promise<void> {
    try {
      // Clear existing matches for this user
      await supabase
        .from('matches')
        .delete()
        .eq('user_from_id', userId);

      // Insert new matches
      if (matches.length > 0) {
        const matchData = matches.map(match => ({
          user_from_id: userId,
          user_to_id: match.userId,
          match_score: match.matchScore,
          category: match.category,
          score_breakdown: match.scoreBreakdown,
          created_at: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from('matches')
          .insert(matchData);

        if (error) {
          logger.error('Error saving matches:', error);
          throw error;
        }
      }

      logger.info(`Saved ${matches.length} matches for user ${userId}`);
    } catch (error) {
      logger.error(`Error saving matches for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Trigger async match calculation (adds to queue)
   */
  async triggerAsyncMatchCalculation(userId: string): Promise<void> {
    try {
      await triggerMatchCalculation(userId);
      logger.info(`Triggered async match calculation for user ${userId}`);
    } catch (error) {
      logger.error(`Error triggering match calculation for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Force refresh matches (clear cache and recalculate)
   */
  async refreshMatches(userId: string): Promise<MatchCandidate[]> {
    // Clear cache
    await this.invalidateUserCache(userId);
    
    // Recalculate and return
    return this.getAllMatches(userId);
  }
}

export default new MatchService();

