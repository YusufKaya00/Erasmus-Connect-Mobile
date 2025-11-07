-- ============================================
-- MATCH PREFERENCES TABLE
-- ============================================

-- Create enum types for match preferences
CREATE TYPE smoking_preference_enum AS ENUM ('NO_PREFERENCE', 'NON_SMOKER_ONLY', 'SMOKER');
CREATE TYPE sleep_schedule_enum AS ENUM ('NO_PREFERENCE', 'EARLY_BIRD', 'NIGHT_OWL');

-- Create match_preferences table
CREATE TABLE IF NOT EXISTS match_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE,
  
  -- Roommate Preferences
  preferred_gender gender_enum,
  cleanliness INTEGER DEFAULT 3 CHECK (cleanliness >= 1 AND cleanliness <= 5),
  smoking_preference smoking_preference_enum DEFAULT 'NO_PREFERENCE',
  sleep_schedule sleep_schedule_enum DEFAULT 'NO_PREFERENCE',
  
  -- Mentor Preferences
  is_mentor BOOLEAN DEFAULT FALSE,
  looking_for_mentor BOOLEAN DEFAULT FALSE,
  
  -- Communication Preferences
  activity_types TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key to profiles table
  CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_match_preferences_profile_id ON match_preferences(profile_id);
CREATE INDEX idx_match_preferences_is_mentor ON match_preferences(is_mentor);
CREATE INDEX idx_match_preferences_looking_for_mentor ON match_preferences(looking_for_mentor);

-- GIN index for array searches (activity_types)
CREATE INDEX idx_match_preferences_activity_types ON match_preferences USING GIN(activity_types);

-- Update timestamp trigger
CREATE TRIGGER match_preferences_updated_at
  BEFORE UPDATE ON match_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE match_preferences IS 'User matching preferences for roommate, mentor, and communication matching';
COMMENT ON COLUMN match_preferences.cleanliness IS 'Cleanliness level from 1-5';
COMMENT ON COLUMN match_preferences.activity_types IS 'Array of activity types user is interested in (travel, cafe, sports, etc.)';

