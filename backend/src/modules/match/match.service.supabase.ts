import { getSupabaseClient } from '@/shared/config/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export class MatchServiceSupabase {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  /**
   * Find matches for a user using the advanced SQL algorithm
   */
  async findMatches(userId: string, options: {
    limit?: number;
    minScore?: number;
  } = {}) {
    const limit = options.limit || 20;
    const minScore = options.minScore || 20.0;

    try {
      const { data, error } = await this.supabase.rpc('find_matches', {
        p_user_id: userId,
        p_limit: limit,
        p_min_score: minScore,
      });

      if (error) {
        throw new Error(`Failed to find matches: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Find matches error:', error);
      throw error;
    }
  }

  /**
   * Create a match between two users
   */
  async createMatch(userFromId: string, userToId: string, matchScore: number, scoreBreakdown?: any) {
    const { data, error } = await this.supabase
      .from('matches')
      .insert({
        user_from_id: userFromId,
        user_to_id: userToId,
        match_score: matchScore,
        score_breakdown: scoreBreakdown || null,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      // Check if match already exists
      if (error.code === '23505') {
        throw new Error('Match already exists between these users');
      }
      throw new Error(`Failed to create match: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user's matches
   */
  async getUserMatches(userId: string, filters: {
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
    page?: number;
    limit?: number;
  } = {}) {
    let query = this.supabase
      .from('matches')
      .select(`
        *,
        user_from:profiles!matches_user_from_id_fkey(*),
        user_to:profiles!matches_user_to_id_fkey(*)
      `)
      .or(`user_from_id.eq.${userId},user_to_id.eq.${userId}`)
      .order('match_score', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply status filter
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get matches: ${error.message}`);
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Get a specific match
   */
  async getMatch(matchId: string) {
    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        user_from:profiles!matches_user_from_id_fkey(*),
        user_to:profiles!matches_user_to_id_fkey(*)
      `)
      .eq('id', matchId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get match: ${error.message}`);
    }

    return data;
  }

  /**
   * Update match status
   */
  async updateMatchStatus(matchId: string, userId: string, status: 'ACCEPTED' | 'REJECTED') {
    // First check if user is part of this match
    const match = await this.getMatch(matchId);
    
    if (!match) {
      throw new Error('Match not found');
    }

    if (match.user_from_id !== userId && match.user_to_id !== userId) {
      throw new Error('Unauthorized to update this match');
    }

    const { data, error } = await this.supabase
      .from('matches')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update match status: ${error.message}`);
    }

    return data;
  }

  /**
   * Share contact information
   */
  async shareContact(matchId: string, userId: string) {
    const match = await this.getMatch(matchId);
    
    if (!match) {
      throw new Error('Match not found');
    }

    const isUserFrom = match.user_from_id === userId;
    const isUserTo = match.user_to_id === userId;

    if (!isUserFrom && !isUserTo) {
      throw new Error('Unauthorized');
    }

    const updateData: any = {};

    if (isUserFrom) {
      updateData.contact_shared_by_from = true;
    } else {
      updateData.contact_shared_by_to = true;
    }

    // If both users have shared, set contact_shared_at
    if (
      (isUserFrom && match.contact_shared_by_to) ||
      (isUserTo && match.contact_shared_by_from)
    ) {
      updateData.contact_shared_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('matches')
      .update(updateData)
      .eq('id', matchId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to share contact: ${error.message}`);
    }

    return data;
  }

  /**
   * Get match statistics for a user
   */
  async getMatchStats(userId: string) {
    const { data: pendingCount } = await this.supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .or(`user_from_id.eq.${userId},user_to_id.eq.${userId}`)
      .eq('status', 'PENDING');

    const { data: acceptedCount } = await this.supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .or(`user_from_id.eq.${userId},user_to_id.eq.${userId}`)
      .eq('status', 'ACCEPTED');

    const { data: totalCount } = await this.supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .or(`user_from_id.eq.${userId},user_to_id.eq.${userId}`);

    return {
      pending: pendingCount || 0,
      accepted: acceptedCount || 0,
      total: totalCount || 0,
    };
  }

  /**
   * Trigger match algorithm for a user
   * This will find potential matches and create match records
   */
  async triggerMatchAlgorithm(userId: string) {
    try {
      // Find potential matches
      const potentialMatches = await this.findMatches(userId, {
        limit: 50,
        minScore: 30.0, // Higher threshold for auto-matching
      });

      const createdMatches = [];

      // Create match records for top matches
      for (const match of potentialMatches.slice(0, 10)) {
        try {
          // Check if match already exists
          const { data: existingMatch } = await this.supabase
            .from('matches')
            .select('id')
            .or(`and(user_from_id.eq.${userId},user_to_id.eq.${match.user_id}),and(user_from_id.eq.${match.user_id},user_to_id.eq.${userId})`)
            .single();

          if (!existingMatch) {
            const newMatch = await this.createMatch(
              userId,
              match.user_id,
              match.match_score,
              match.score_breakdown
            );
            createdMatches.push(newMatch);
          }
        } catch (error) {
          // Continue with other matches if one fails
          console.error(`Failed to create match with user ${match.user_id}:`, error);
        }
      }

      return {
        totalFound: potentialMatches.length,
        created: createdMatches.length,
        matches: createdMatches,
      };
    } catch (error: any) {
      console.error('Trigger match algorithm error:', error);
      throw error;
    }
  }

  /**
   * Delete a match
   */
  async deleteMatch(matchId: string, userId: string) {
    const match = await this.getMatch(matchId);
    
    if (!match) {
      throw new Error('Match not found');
    }

    if (match.user_from_id !== userId && match.user_to_id !== userId) {
      throw new Error('Unauthorized to delete this match');
    }

    const { error } = await this.supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) {
      throw new Error(`Failed to delete match: ${error.message}`);
    }

    return true;
  }
}

export default new MatchServiceSupabase();

