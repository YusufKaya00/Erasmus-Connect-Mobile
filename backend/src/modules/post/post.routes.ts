import { Router } from 'express';
import { authenticate } from '@shared/middleware/auth';
import { upload } from '@shared/middleware/upload';
import { postController } from './post.controller';

const router = Router();

// Public routes
router.get('/', postController.getAll.bind(postController));
router.get('/:id', postController.getById.bind(postController));

// Protected routes
router.use(authenticate);

router.post('/', upload.array('images', 5), postController.create.bind(postController));
router.post('/:id/like', postController.like.bind(postController));
router.post('/:id/comment', postController.addComment.bind(postController));
router.delete('/:id', postController.delete.bind(postController));

export default router;
