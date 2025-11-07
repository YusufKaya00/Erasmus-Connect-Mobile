import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, authorize } from '@shared/middleware/auth';
import { postController } from '@modules/post/post.controller';
import { categoryController } from '@modules/category/category.controller';
import { countryController } from '@modules/country/country.controller';
import { commentController } from '@modules/comment/comment.controller';

const router = Router();
const adminController = new AdminController();

// All routes in this file are protected and only accessible by ADMIN role
router.use(authenticate, authorize('ADMIN'));

// User Management Routes
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/profile', adminController.updateUserProfile);
router.delete('/users/:id', adminController.deleteUser);
router.delete('/users/:id/profile', adminController.deleteUserProfile);
router.delete('/users/:id/complete', adminController.deleteUserCompletely);

// Post Management Routes
router.get('/posts', postController.getAllForAdmin);
router.get('/posts/:id', postController.getById);
router.post('/posts', postController.create);
router.patch('/posts/:id', postController.updatePost);
router.delete('/posts/:id', postController.deleteByAdmin);

// Category Management Routes
router.get('/categories', categoryController.getAll);
router.get('/categories/:id', categoryController.getById);
router.post('/categories', categoryController.createCategory);
router.patch('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Country Management Routes
router.get('/countries', countryController.getAll);
router.get('/countries/:id', countryController.getById);
router.post('/countries', countryController.createCountry);
router.patch('/countries/:id', countryController.updateCountry);
router.delete('/countries/:id', countryController.deleteCountry);

// Comment Management Routes
router.get('/comments', commentController.getAllComments);
router.get('/comments/:id', commentController.getCommentById);
router.delete('/comments/:id', commentController.deleteComment);

// Travel Routes Management Routes
router.get('/routes', adminController.getTravelRoutes);
router.get('/routes/:id', adminController.getTravelRouteById);
router.delete('/routes/:id', adminController.deleteTravelRoute);

// Statistics Routes (moved to admin)
router.get('/stats/overall', adminController.getOverallStats);

export default router;
