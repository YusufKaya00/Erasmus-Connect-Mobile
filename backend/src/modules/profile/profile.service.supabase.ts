import { getSupabaseClient } from '@/shared/config/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseCountryUUIDByName, getSupabaseCountryUUIDByCode } from '@/shared/utils/country-mapping';

export class ProfileServiceSupabase {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  /**
   * Get profile by user ID
   */
  async getProfileByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Profile not found
      }
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    // If destination_country_id exists, fetch country separately
    let countryData = null;
    if (data.destination_country_id) {
      const { data: country } = await this.supabase
        .from('countries')
        .select('*')
        .eq('id', data.destination_country_id)
        .single();
      countryData = country;
    }

    // Fetch match preferences
    let matchPreferences = null;
    const { data: prefsData } = await this.supabase
      .from('match_preferences')
      .select('*')
      .eq('profile_id', data.id)
      .single();
    
    if (prefsData) {
      matchPreferences = this.transformPreferencesToCamelCase(prefsData);
    }

    // Transform snake_case to camelCase for frontend compatibility
    return this.transformProfileToCamelCase({ ...data, destination_country: countryData, match_preferences: matchPreferences });
  }

  /**
   * Create new profile
   */
  async createProfile(userId: string, profileData: any) {
    // Ülke ID'sini Supabase UUID'sine çevir
    let destinationCountryId = null;
    
    if (profileData.destinationCountryId) {
      console.log('🔍 Processing destinationCountryId:', profileData.destinationCountryId);
      
      // Eğer zaten UUID formatındaysa direkt kullan
      if (typeof profileData.destinationCountryId === 'string' && 
          profileData.destinationCountryId.length === 36 && 
          profileData.destinationCountryId.includes('-')) {
        destinationCountryId = profileData.destinationCountryId;
        console.log('✅ Using UUID directly:', destinationCountryId);
      } 
      // MongoDB ObjectId ise ülke adı/kodu ile ara
      else if (typeof profileData.destinationCountryId === 'string' && profileData.destinationCountryId.length === 24) {
        console.log('🔍 MongoDB ObjectId detected, searching by name/code...');
        
        // Frontend'den gelen ülke bilgilerini kullan
        if (profileData.destinationCountryName) {
          destinationCountryId = await getSupabaseCountryUUIDByName(profileData.destinationCountryName);
          console.log(`🔍 Searching by name "${profileData.destinationCountryName}":`, destinationCountryId);
        }
        
        if (!destinationCountryId && profileData.destinationCountryCode) {
          destinationCountryId = await getSupabaseCountryUUIDByCode(profileData.destinationCountryCode);
          console.log(`🔍 Searching by code "${profileData.destinationCountryCode}":`, destinationCountryId);
        }
      }
      // Diğer durumlar için direkt kullan
      else {
        destinationCountryId = profileData.destinationCountryId;
      }
    }
    
    console.log('🎯 Final destinationCountryId:', destinationCountryId);

    const { data, error } = await this.supabase
      .from('profiles')
      .insert({
        user_id: userId,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        bio: profileData.bio || null,
        phone: profileData.phone || null,
        phone_country_code: profileData.phoneCountryCode || '+90',
        birth_date: profileData.birthDate || null,
        gender: profileData.gender || null,
        nationality: profileData.nationality || null,
        destination_country_id: destinationCountryId,
        destination_city: profileData.destinationCity || null,
        academic_term: profileData.academicTerm || null,
        academic_year: profileData.academicYear || null,
        home_university: profileData.homeUniversity || null,
        destination_university: profileData.destinationUniversity || null,
        field_of_study: profileData.fieldOfStudy || null,
        has_returned_from_erasmus: profileData.hasReturnedFromErasmus || false,
        erasmus_start_date: profileData.erasmusStartDate || null,
        erasmus_end_date: profileData.erasmusEndDate || null,
        interests: profileData.interests || [],
        languages: profileData.languages || [],
        looking_for_roommate: profileData.lookingForRoommate || false,
        whatsapp: profileData.whatsapp || null,
        instagram: profileData.instagram || null,
        twitter: profileData.twitter || null,
        linkedin: profileData.linkedin || null,
        facebook: profileData.facebook || null,
        show_phone: profileData.showPhone || false,
        show_email: profileData.showEmail || false,
        profile_visibility: profileData.profileVisibility || 'PUBLIC',
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return this.transformProfileToCamelCase(data);
  }

  /**
   * Update profile
   */
  async updateProfile(userId: string, profileData: any) {
    const updateData: any = {};

    // Map camelCase to snake_case and filter undefined values
    if (profileData.firstName !== undefined) updateData.first_name = profileData.firstName;
    if (profileData.lastName !== undefined) updateData.last_name = profileData.lastName;
    if (profileData.bio !== undefined) updateData.bio = profileData.bio || null;
    if (profileData.phone !== undefined) updateData.phone = profileData.phone || null;
    if (profileData.phoneCountryCode !== undefined) updateData.phone_country_code = profileData.phoneCountryCode;
    if (profileData.birthDate !== undefined) updateData.birth_date = profileData.birthDate || null;
    if (profileData.gender !== undefined) updateData.gender = profileData.gender || null;
    if (profileData.nationality !== undefined) updateData.nationality = profileData.nationality || null;
    if (profileData.destinationCountryId !== undefined) {
      // Ülke ID'sini Supabase UUID'sine çevir
      let destinationCountryId = null;
      
      if (profileData.destinationCountryId) {
        console.log('🔍 Processing destinationCountryId (update):', profileData.destinationCountryId);
        
        // Eğer zaten UUID formatındaysa direkt kullan
        if (typeof profileData.destinationCountryId === 'string' && 
            profileData.destinationCountryId.length === 36 && 
            profileData.destinationCountryId.includes('-')) {
          destinationCountryId = profileData.destinationCountryId;
          console.log('✅ Using UUID directly (update):', destinationCountryId);
        } 
        // MongoDB ObjectId ise ülke adı/kodu ile ara
        else if (typeof profileData.destinationCountryId === 'string' && profileData.destinationCountryId.length === 24) {
          console.log('🔍 MongoDB ObjectId detected (update), searching by name/code...');
          
          // Frontend'den gelen ülke bilgilerini kullan
          if (profileData.destinationCountryName) {
            destinationCountryId = await getSupabaseCountryUUIDByName(profileData.destinationCountryName);
            console.log(`🔍 Searching by name "${profileData.destinationCountryName}" (update):`, destinationCountryId);
          }
          
          if (!destinationCountryId && profileData.destinationCountryCode) {
            destinationCountryId = await getSupabaseCountryUUIDByCode(profileData.destinationCountryCode);
            console.log(`🔍 Searching by code "${profileData.destinationCountryCode}" (update):`, destinationCountryId);
          }
        }
        // Diğer durumlar için direkt kullan
        else {
          destinationCountryId = profileData.destinationCountryId;
        }
      }
      
      console.log('🎯 Final destinationCountryId (update):', destinationCountryId);
      updateData.destination_country_id = destinationCountryId;
    }
    if (profileData.destinationCity !== undefined) updateData.destination_city = profileData.destinationCity || null;
    if (profileData.academicTerm !== undefined) updateData.academic_term = profileData.academicTerm || null;
    if (profileData.academicYear !== undefined) updateData.academic_year = profileData.academicYear || null;
    if (profileData.homeUniversity !== undefined) updateData.home_university = profileData.homeUniversity || null;
    if (profileData.destinationUniversity !== undefined) updateData.destination_university = profileData.destinationUniversity || null;
    if (profileData.fieldOfStudy !== undefined) updateData.field_of_study = profileData.fieldOfStudy || null;
    if (profileData.hasReturnedFromErasmus !== undefined) updateData.has_returned_from_erasmus = Boolean(profileData.hasReturnedFromErasmus);
    if (profileData.erasmusStartDate !== undefined) updateData.erasmus_start_date = profileData.erasmusStartDate || null;
    if (profileData.erasmusEndDate !== undefined) updateData.erasmus_end_date = profileData.erasmusEndDate || null;
    if (profileData.interests !== undefined) updateData.interests = profileData.interests || [];
    if (profileData.languages !== undefined) updateData.languages = profileData.languages || [];
    if (profileData.lookingForRoommate !== undefined) updateData.looking_for_roommate = Boolean(profileData.lookingForRoommate);
    if (profileData.whatsapp !== undefined) updateData.whatsapp = profileData.whatsapp || null;
    if (profileData.instagram !== undefined) updateData.instagram = profileData.instagram || null;
    if (profileData.twitter !== undefined) updateData.twitter = profileData.twitter || null;
    if (profileData.linkedin !== undefined) updateData.linkedin = profileData.linkedin || null;
    if (profileData.facebook !== undefined) updateData.facebook = profileData.facebook || null;
    if (profileData.showPhone !== undefined) updateData.show_phone = Boolean(profileData.showPhone);
    if (profileData.showEmail !== undefined) updateData.show_email = Boolean(profileData.showEmail);
    if (profileData.profileVisibility !== undefined) updateData.profile_visibility = profileData.profileVisibility || 'PUBLIC';

    const { data, error } = await this.supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    // Handle match preferences if provided
    if (profileData.matchPreferences) {
      await this.updateMatchPreferences(data.id, profileData.matchPreferences);
    }

    // Fetch updated match preferences
    let matchPreferences = null;
    const { data: prefsData } = await this.supabase
      .from('match_preferences')
      .select('*')
      .eq('profile_id', data.id)
      .single();
    
    if (prefsData) {
      matchPreferences = this.transformPreferencesToCamelCase(prefsData);
    }

    return this.transformProfileToCamelCase({ ...data, match_preferences: matchPreferences });
  }

  /**
   * Update or create match preferences
   */
  private async updateMatchPreferences(profileId: string, preferences: any) {
    const prefsData: any = {};

    if (preferences.preferredGender !== undefined) prefsData.preferred_gender = preferences.preferredGender;
    if (preferences.cleanliness !== undefined) prefsData.cleanliness = preferences.cleanliness;
    if (preferences.smokingPreference !== undefined) prefsData.smoking_preference = preferences.smokingPreference;
    if (preferences.sleepSchedule !== undefined) prefsData.sleep_schedule = preferences.sleepSchedule;
    if (preferences.isMentor !== undefined) prefsData.is_mentor = Boolean(preferences.isMentor);
    if (preferences.lookingForMentor !== undefined) prefsData.looking_for_mentor = Boolean(preferences.lookingForMentor);
    if (preferences.activityTypes !== undefined) prefsData.activity_types = preferences.activityTypes || [];

    // Check if preferences already exist
    const { data: existing } = await this.supabase
      .from('match_preferences')
      .select('id')
      .eq('profile_id', profileId)
      .single();

    if (existing) {
      // Update existing preferences
      const { error } = await this.supabase
        .from('match_preferences')
        .update(prefsData)
        .eq('profile_id', profileId);

      if (error) {
        throw new Error(`Failed to update match preferences: ${error.message}`);
      }
    } else {
      // Create new preferences
      const { error } = await this.supabase
        .from('match_preferences')
        .insert({
          profile_id: profileId,
          ...prefsData,
        });

      if (error) {
        throw new Error(`Failed to create match preferences: ${error.message}`);
      }
    }
  }

  /**
   * Delete profile
   */
  async deleteProfile(userId: string) {
    const { error } = await this.supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete profile: ${error.message}`);
    }

    return true;
  }

  /**
   * Search profiles
   */
  async searchProfiles(filters: any = {}) {
    let query = this.supabase
      .from('profiles')
      .select('*');

    // Apply filters
    if (filters.destinationCountryId) {
      query = query.eq('destination_country_id', filters.destinationCountryId);
    }

    if (filters.destinationCity) {
      query = query.ilike('destination_city', `%${filters.destinationCity}%`);
    }

    if (filters.academicTerm) {
      query = query.eq('academic_term', filters.academicTerm);
    }

    if (filters.academicYear) {
      query = query.eq('academic_year', filters.academicYear);
    }

    if (filters.lookingForRoommate !== undefined) {
      query = query.eq('looking_for_roommate', filters.lookingForRoommate);
    }

    if (filters.hasReturnedFromErasmus !== undefined) {
      query = query.eq('has_returned_from_erasmus', filters.hasReturnedFromErasmus);
    }

    // Only show public profiles or profiles user has access to
    query = query.eq('profile_visibility', 'PUBLIC');

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to search profiles: ${error.message}`);
    }

    return {
      data: data?.map(p => this.transformProfileToCamelCase(p)) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Convert snake_case response to camelCase for frontend
   */
  private transformProfileToCamelCase(profile: any) {
    if (!profile) return null;

    return {
      id: profile.id,
      userId: profile.user_id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      photoUrl: profile.photo_url,
      bio: profile.bio,
      phone: profile.phone,
      phoneCountryCode: profile.phone_country_code,
      birthDate: profile.birth_date,
      gender: profile.gender,
      nationality: profile.nationality,
      destinationCountryId: profile.destination_country_id,
      destinationCity: profile.destination_city,
      academicTerm: profile.academic_term,
      academicYear: profile.academic_year,
      homeUniversity: profile.home_university,
      destinationUniversity: profile.destination_university,
      fieldOfStudy: profile.field_of_study,
      hasReturnedFromErasmus: profile.has_returned_from_erasmus,
      erasmusStartDate: profile.erasmus_start_date,
      erasmusEndDate: profile.erasmus_end_date,
      interests: profile.interests,
      languages: profile.languages,
      lookingForRoommate: profile.looking_for_roommate,
      whatsapp: profile.whatsapp,
      instagram: profile.instagram,
      twitter: profile.twitter,
      linkedin: profile.linkedin,
      facebook: profile.facebook,
      showPhone: profile.show_phone,
      showEmail: profile.show_email,
      profileVisibility: profile.profile_visibility,
      destinationCountry: profile.destination_country ? {
        id: profile.destination_country.id,
        name: profile.destination_country.name,
        code: profile.destination_country.code,
        flag: profile.destination_country.flag,
        continent: profile.destination_country.continent,
      } : null,
      matchPreferences: profile.match_preferences || null,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  }

  /**
   * Convert match preferences snake_case to camelCase
   */
  private transformPreferencesToCamelCase(prefs: any) {
    if (!prefs) return null;

    return {
      id: prefs.id,
      profileId: prefs.profile_id,
      preferredGender: prefs.preferred_gender,
      cleanliness: prefs.cleanliness,
      smokingPreference: prefs.smoking_preference,
      sleepSchedule: prefs.sleep_schedule,
      isMentor: prefs.is_mentor,
      lookingForMentor: prefs.looking_for_mentor,
      activityTypes: prefs.activity_types || [],
      createdAt: prefs.created_at,
      updatedAt: prefs.updated_at,
    };
  }
}

export default new ProfileServiceSupabase();

