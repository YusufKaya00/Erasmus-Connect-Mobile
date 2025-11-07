import { Request, Response } from 'express';
import matchService, { MatchCategory } from './match.service';
import logger from '@shared/utils/logger';

export class MatchController {
  
  /**
   * Get all matches for current user (all categories or specific)
   * GET /matches?category=ROOMMATE
   */
  async getMatches(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }

      const category = req.query.category as MatchCategory | undefined;
      
      logger.info(`Fetching matches for user ${userId}, category: ${category || 'ALL'}`);

      const matches = await matchService.getAllMatches(userId, category);

      res.json({
        success: true,
        data: {
          matches,
          count: matches.length,
          category: category || 'ALL',
        },
      });
    } catch (error: any) {
      logger.error('Get matches error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to get matches' },
      });
    }
  }

  /**
   * Get roommate matches
   * GET /matches/roommate
   */
  async getRoommateMatches(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }

      logger.info(`Fetching roommate matches for user ${userId}`);

      const matches = await matchService.getRoommateCandidates(userId);

      res.json({
        success: true,
        data: {
          matches,
          count: matches.length,
          category: 'ROOMMATE',
        },
      });
    } catch (error: any) {
      logger.error('Get roommate matches error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to get roommate matches' },
      });
    }
  }

  /**
   * Get mentor matches
   * GET /matches/mentor
   */
  async getMentorMatches(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }

      logger.info(`Fetching mentor matches for user ${userId}`);

      const matches = await matchService.getMentorCandidates(userId);

      res.json({
        success: true,
        data: {
          matches,
          count: matches.length,
          category: 'MENTOR',
        },
      });
    } catch (error: any) {
      logger.error('Get mentor matches error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to get mentor matches' },
      });
    }
  }

  /**
   * Get communication matches
   * GET /matches/communication
   */
  async getCommunicationMatches(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }

      logger.info(`Fetching communication matches for user ${userId}`);

      const matches = await matchService.getCommunicationCandidates(userId);

      res.json({
        success: true,
        data: {
          matches,
          count: matches.length,
          category: 'COMMUNICATION',
        },
      });
    } catch (error: any) {
      logger.error('Get communication matches error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to get communication matches' },
      });
    }
  }
}

export default new MatchController();

