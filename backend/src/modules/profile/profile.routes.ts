import { Router } from 'express';
import { authenticate } from '@middleware/auth';
import { ProfileController } from './profile.controller';

const router = Router();
const profileController = new ProfileController();

// Authenticate all routes
router.use(authenticate);

// Get my profile
router.get('/me', profileController.getMyProfile.bind(profileController));

// Update my profile
router.put('/me', profileController.updateMyProfile.bind(profileController));

// Get user profile by ID
router.get('/:userId', profileController.getUserProfile.bind(profileController));

export default router;
