import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@shared/config/database';
import { AppError } from '@middleware/error-handler';
import { emailService } from '@shared/utils/email.service';
import profileServiceSupabase from '@modules/profile/profile.service.supabase';

interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  private generateAccessToken(userId: string, email: string, role: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    // @ts-ignore - JWT type issue with environment variables
    return jwt.sign(
      { userId, email, role },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  private generateRefreshToken(userId: string): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    // @ts-ignore - JWT type issue with environment variables
    return jwt.sign(
      { userId },
      secret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
  }

  async register(data: RegisterDto) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, 'User with this email already exists', 'CONFLICT');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hours

    // Create user (no profile in MongoDB)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        provider: 'local',
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Create profile in Supabase
    try {
      console.log('📝 Creating Supabase profile for new user:', user.id);
      await profileServiceSupabase.createProfile(user.id, {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      console.log('✅ Supabase profile created successfully');
    } catch (error) {
      console.error('❌ Error creating Supabase profile:', error);
      // Don't fail registration if Supabase profile creation fails
    }

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken, data.firstName);

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = this.generateRefreshToken(user.id);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
    };
  }

  async login(data: LoginDto) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check if active
    if (!user.isActive) {
      throw new AppError(403, 'Account is inactive', 'ACCOUNT_INACTIVE');
    }

    // Check if email is verified (only for local accounts in production)
    // Skip verification check in development for easier testing
    const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
    if (requireEmailVerification && user.provider === 'local' && !user.isVerified) {
      throw new AppError(403, 'Please verify your email before logging in', 'EMAIL_NOT_VERIFIED');
    }

    // Verify password
    if (!user.password) {
      // Account was created via OAuth (Google, etc.)
      throw new AppError(400, 'This account uses Google login. Please use "Continue with Google" button.', 'USE_OAUTH');
    }
    
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = this.generateRefreshToken(user.id);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new AppError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(
      session.user.id,
      session.user.email,
      session.user.role
    );

    return {
      accessToken,
      expiresIn: 7 * 24 * 60 * 60,
    };
  }

  async logout(refreshToken: string) {
    // Delete session
    await prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  async verifyEmail(token: string) {
    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      throw new AppError(400, 'Invalid or expired verification token', 'INVALID_TOKEN');
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, 'User');

    return {
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isVerified: true,
      },
    };
  }

  async resendVerificationEmail(email: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    if (user.isVerified) {
      throw new AppError(400, 'Email is already verified', 'ALREADY_VERIFIED');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send verification email
    await emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      'User'
    );

    return {
      message: 'Verification email sent successfully',
    };
  }

  async googleAuth(profile: any) {
    const email = profile.emails[0].value;
    const googleId = profile.id;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Update provider info if this is their first Google login
      if (!user.providerId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'google',
            providerId: googleId,
            isVerified: true, // Google accounts are pre-verified
          },
        });
      }
    } else {
      // Create new user (no profile in MongoDB)
      user = await prisma.user.create({
        data: {
          email,
          provider: 'google',
          providerId: googleId,
          isVerified: true, // Google accounts are pre-verified
        },
      });

      // Send welcome email
      await emailService.sendWelcomeEmail(email, profile.name.givenName || 'User');
    }

    // Ensure profile exists in Supabase
    try {
      const supabaseProfile = await profileServiceSupabase.getProfileByUserId(user.id);
      
      if (!supabaseProfile) {
        // Create profile in Supabase if it doesn't exist
        console.log('📝 Creating Supabase profile for Google OAuth user:', user.id);
        await profileServiceSupabase.createProfile(user.id, {
          firstName: profile.name.givenName || 'User',
          lastName: profile.name.familyName || '',
          photoUrl: profile.photos?.[0]?.value,
        });
        console.log('✅ Supabase profile created successfully');
      }
    } catch (error) {
      console.error('❌ Error creating Supabase profile:', error);
      // Don't fail the login if Supabase profile creation fails
      // The user can create/update their profile later
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = this.generateRefreshToken(user.id);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60,
      },
    };
  }
}

export const authService = new AuthService();

