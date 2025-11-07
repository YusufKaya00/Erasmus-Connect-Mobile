import { Request, Response } from 'express';
import { AuthRequest } from '@middleware/auth';
import { authService } from './auth.service';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);

    res.status(201).json({
      success: true,
      data: result,
    });
  }

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    res.json({
      success: true,
      data: result,
    });
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
        },
      });
    }

    const result = await authService.refreshToken(refreshToken);

    return res.json({
      success: true,
      data: result,
    });
  }

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  async getMe(req: AuthRequest, res: Response) {
    const userId = req.user!.id;
    const profile = await authService.getProfile(userId);

    return res.json({
      success: true,
      data: profile,
    });
  }

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Verification token is required',
        },
      });
    }

    const result = await authService.verifyEmail(token);

    return res.json({
      success: true,
      data: result,
    });
  }

  async resendVerification(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
        },
      });
    }

    const result = await authService.resendVerificationEmail(email);

    return res.json({
      success: true,
      data: result,
    });
  }

  async googleCallback(req: Request, res: Response) {
    // This will be called by Passport after successful Google authentication
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }

    // Redirect to frontend with tokens
    const { tokens } = user;
    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
    );
  }
}

export const authController = new AuthController();

