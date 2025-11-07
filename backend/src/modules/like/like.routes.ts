import { Router } from 'express';
import { authenticate } from '@shared/middleware/auth';
import likeController from './like.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate as any);

/**
 * @route   POST /api/v1/likes
 * @desc    Like a user
 * @body    { likedId: string, category: string }
 * @access  Private
 */
router.post('/', likeController.likeUser.bind(likeController));

/**
 * @route   DELETE /api/v1/likes
 * @desc    Unlike a user
 * @body    { likedId: string, category: string }
 * @access  Private
 */
router.delete('/', likeController.unlikeUser.bind(likeController));

/**
 * @route   GET /api/v1/likes
 * @desc    Get user's likes
 * @query   category - Optional: ROOMMATE, MENTOR, COMMUNICATION
 * @access  Private
 */
router.get('/', likeController.getUserLikes.bind(likeController));

/**
 * @route   GET /api/v1/likes/liked-by
 * @desc    Get users who liked current user
 * @query   category - Optional: ROOMMATE, MENTOR, COMMUNICATION
 * @access  Private
 */
router.get('/liked-by', likeController.getLikedByUsers.bind(likeController));

/**
 * @route   GET /api/v1/likes/check
 * @desc    Check if user is liked
 * @query   likedId: string, category: string
 * @access  Private
 */
router.get('/check', likeController.checkIfLiked.bind(likeController));

export default router;
