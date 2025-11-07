import { Request, Response } from 'express';
import profileService from './profile.service.supabase';

export class ProfileController {
  // Get current user's profile
  async getMyProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }

      console.log('🔍 Fetching profile for user:', userId);

      const profile = await profileService.getProfileByUserId(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { message: 'Profile not found' },
        });
      }

      console.log('✅ Profile found:', profile.id);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error('❌ Get profile error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch profile' },
      });
    }
  }

  // Update current user's profile
  async updateMyProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      console.log('🔍 Update Profile Request (Supabase):', {
        userId,
        hasUser: !!req.user,
        bodyKeys: Object.keys(req.body),
      });
      
      if (!userId) {
        console.error('❌ No userId found in request');
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }

      // Check if profile exists
      const existingProfile = await profileService.getProfileByUserId(userId);
      
      let profile;

      if (existingProfile) {
        // Update existing profile
        console.log('📝 Updating existing profile in Supabase');
        profile = await profileService.updateProfile(userId, req.body);
      } else {
        // Create new profile - validate required fields
        if (!req.body.firstName || !req.body.lastName) {
          return res.status(400).json({
            success: false,
            error: { message: 'First name and last name are required' },
          });
        }

        console.log('📝 Creating new profile in Supabase');
        profile = await profileService.createProfile(userId, req.body);
      }

      console.log('✅ Profile saved successfully to Supabase:', profile.id);
      
      res.json({
        success: true,
        data: profile,
        message: 'Profile updated successfully',
      });
    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3),
      });
      
      res.status(500).json({
        success: false,
        error: { 
          message: error.message || 'Failed to update profile',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
      });
    }
  }

  // Get user profile by ID
  async getUserProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      console.log('🔍 Fetching public profile from Supabase:', userId);

      const profile = await profileService.getProfileByUserId(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { message: 'Profile not found' },
        });
      }

      console.log('✅ Profile fetched:', {
        id: profile.id,
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        hasDestinationCountry: !!profile.destinationCountry
      });

      // Check privacy settings
      if (profile.profileVisibility === 'PRIVATE' && profile.userId !== req.user?.id) {
        return res.status(403).json({
          success: false,
          error: { message: 'This profile is private' },
        });
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error('❌ Get user profile error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch profile' },
      });
    }
  }
}

