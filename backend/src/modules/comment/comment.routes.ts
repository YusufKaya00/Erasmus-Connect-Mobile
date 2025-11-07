import { Router } from 'express';
import { commentController } from './comment.controller';
import { authenticate, authorize } from '@shared/middleware/auth';

const router = Router();

// Public routes
router.get('/', commentController.getAllComments);

// Protected routes
router.use(authenticate);
router.use(authorize(['ADMIN']));
router.get('/:id', commentController.getCommentById);
router.delete('/:id', commentController.deleteComment);

export const commentRoutes = router;
