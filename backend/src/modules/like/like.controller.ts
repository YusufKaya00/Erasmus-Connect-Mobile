import { Request, Response } from 'express';
import { likeService } from './like.service';
import logger from '@shared/utils/logger';

export class LikeController {
  // ============================================
  // LIKE USER
  // ============================================
  
  async likeUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: { message: 'Unauthorized' } 
        });
      }

      const { likedId, category } = req.body;

      if (!likedId || !category) {
        return res.status(400).json({
          success: false,
          error: { message: 'Missing required fields: likedId, category' }
        });
      }

      if (!['ROOMMATE', 'MENTOR', 'COMMUNICATION'].includes(category)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid category. Must be ROOMMATE, MENTOR, or COMMUNICATION' }
        });
      }

      const result = await likeService.likeUser(userId, likedId, category);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: { message: result.message || 'Failed to like user' }
        });
      }

      res.json({
        success: true,
        data: {
          message: result.message
        }
      });
    } catch (error: any) {
      logger.error('Error in likeUser:', error);
      res.status(500).json({ 
        success: false, 
        error: { message: error.message || 'An error occurred' } 
      });
    }
  }

  // ============================================
  // UNLIKE USER
  // ============================================
  
  async unlikeUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: { message: 'Unauthorized' } 
        });
      }

      const { likedId, category } = req.body;

      if (!likedId || !category) {
        return res.status(400).json({
          success: false,
          error: { message: 'Missing required fields: likedId, category' }
        });
      }

      if (!['ROOMMATE', 'MENTOR', 'COMMUNICATION'].includes(category)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid category. Must be ROOMMATE, MENTOR, or COMMUNICATION' }
        });
      }

      const result = await likeService.unlikeUser(userId, likedId, category);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: { message: result.message || 'Failed to unlike user' }
        });
      }

      res.json({
        success: true,
        data: {
          message: result.message
        }
      });
    } catch (error: any) {
      logger.error('Error in unlikeUser:', error);
      res.status(500).json({ 
        success: false, 
        error: { message: error.message || 'An error occurred' } 
      });
    }
  }

  // ============================================
  // GET USER LIKES
  // ============================================
  
  async getUserLikes(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: { message: 'Unauthorized' } 
        });
      }

      const { category } = req.query;
      const validCategories = ['ROOMMATE', 'MENTOR', 'COMMUNICATION'];
      
      if (category && !validCategories.includes(category as string)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid category. Must be ROOMMATE, MENTOR, or COMMUNICATION' }
        });
      }

      const likes = await likeService.getUserLikes(
        userId, 
        category as 'ROOMMATE' | 'MENTOR' | 'COMMUNICATION' | undefined
      );

      res.json({
        success: true,
        data: likes
      });
    } catch (error: any) {
      logger.error('Error in getUserLikes:', error);
      res.status(500).json({ 
        success: false, 
        error: { message: error.message || 'An error occurred' } 
      });
    }
  }

  // ============================================
  // GET LIKED BY USERS
  // ============================================
  
  async getLikedByUsers(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: { message: 'Unauthorized' } 
        });
      }

      const { category } = req.query;
      const validCategories = ['ROOMMATE', 'MENTOR', 'COMMUNICATION'];
      
      if (category && !validCategories.includes(category as string)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid category. Must be ROOMMATE, MENTOR, or COMMUNICATION' }
        });
      }

      const likes = await likeService.getLikedByUsers(
        userId, 
        category as 'ROOMMATE' | 'MENTOR' | 'COMMUNICATION' | undefined
      );

      res.json({
        success: true,
        data: likes
      });
    } catch (error: any) {
      logger.error('Error in getLikedByUsers:', error);
      res.status(500).json({ 
        success: false, 
        error: { message: error.message || 'An error occurred' } 
      });
    }
  }

  // ============================================
  // CHECK IF LIKED
  // ============================================
  
  async checkIfLiked(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: { message: 'Unauthorized' } 
        });
      }

      const { likedId, category } = req.query;

      if (!likedId || !category) {
        return res.status(400).json({
          success: false,
          error: { message: 'Missing required fields: likedId, category' }
        });
      }

      if (!['ROOMMATE', 'MENTOR', 'COMMUNICATION'].includes(category as string)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid category. Must be ROOMMATE, MENTOR, or COMMUNICATION' }
        });
      }

      const isLiked = await likeService.isLiked(
        userId, 
        likedId as string, 
        category as 'ROOMMATE' | 'MENTOR' | 'COMMUNICATION'
      );

      res.json({
        success: true,
        data: {
          isLiked
        }
      });
    } catch (error: any) {
      logger.error('Error in checkIfLiked:', error);
      res.status(500).json({ 
        success: false, 
        error: { message: error.message || 'An error occurred' } 
      });
    }
  }
}

export default new LikeController();
