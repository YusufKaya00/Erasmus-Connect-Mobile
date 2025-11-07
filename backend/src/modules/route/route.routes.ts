import { Router } from 'express';
import { routeController } from './route.controller';
import { authenticate } from '@middleware/auth';

const router = Router();

// Public routes
router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);
router.get('/user/:userId', routeController.getUserRoutes);

// Protected routes
router.post('/', authenticate, routeController.createRoute);
router.put('/:id', authenticate, routeController.updateRoute);
router.delete('/:id', authenticate, routeController.deleteRoute);
router.post('/:id/comments', authenticate, routeController.addComment);

export default router;

