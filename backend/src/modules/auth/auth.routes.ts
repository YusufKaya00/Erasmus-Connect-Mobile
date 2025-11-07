import { Router, Request, Response } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '@middleware/auth';
import { authRateLimiter } from '@middleware/rate-limiter';
import passport from 'passport';

const router = Router();

// POST /auth/register - Register new user
router.post('/register', authRateLimiter, authController.register);

// POST /auth/login - Login
router.post('/login', authRateLimiter, authController.login);

// POST /auth/refresh - Refresh access token
router.post('/refresh', authController.refresh);

// POST /auth/logout - Logout
router.post('/logout', authController.logout);

// GET /auth/me - Get current user profile
// @ts-ignore - Type compatibility issue with AuthRequest
router.get('/me', authenticate, authController.getMe);

// GET /auth/verify-email - Verify email address
router.get('/verify-email', authController.verifyEmail);

// POST /auth/resend-verification - Resend verification email
router.post('/resend-verification', authRateLimiter, authController.resendVerification);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  (req: Request, res: Response) => {
    authController.googleCallback(req, res);
  }
);

export default router;

