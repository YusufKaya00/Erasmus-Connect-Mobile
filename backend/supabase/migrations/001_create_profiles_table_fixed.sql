-- ============================================
-- PROFILES TABLE (MongoDB ObjectId Compatible)
-- ============================================

-- Create enum types
CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE academic_term_enum AS ENUM ('FALL', 'SPRING', 'SUMMER', 'FULL_YEAR');
CREATE TYPE profile_visibility_enum AS ENUM ('PUBLIC', 'MATCHES_ONLY', 'PRIVATE');

-- Create profiles table with TEXT user_id (for MongoDB ObjectId compatibility)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE, -- TEXT instead of UUID for MongoDB ObjectId
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  photo_url TEXT,
  bio TEXT,
  phone VARCHAR(20),
  phone_country_code VARCHAR(10) DEFAULT '+90',
  birth_date DATE,
  gender gender_enum,
  nationality VARCHAR(100),
  
  -- Erasmus Information
  destination_country_id UUID,
  destination_city VARCHAR(100),
  academic_term academic_term_enum,
  academic_year VARCHAR(10),
  home_university VARCHAR(255),
  destination_university VARCHAR(255),
  field_of_study VARCHAR(255),
  has_returned_from_erasmus BOOLEAN DEFAULT FALSE,
  erasmus_start_date DATE,
  erasmus_end_date DATE,
  
  -- Preferences
  interests TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  looking_for_roommate BOOLEAN DEFAULT FALSE,
  
  -- Social Media
  whatsapp VARCHAR(255),
  instagram VARCHAR(255),
  twitter VARCHAR(255),
  linkedin VARCHAR(255),
  facebook VARCHAR(255),
  
  -- Privacy Settings
  show_phone BOOLEAN DEFAULT FALSE,
  show_email BOOLEAN DEFAULT FALSE,
  profile_visibility profile_visibility_enum DEFAULT 'PUBLIC',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_destination_country ON profiles(destination_country_id);
CREATE INDEX idx_profiles_destination_city ON profiles(destination_city);
CREATE INDEX idx_profiles_academic_term ON profiles(academic_term);
CREATE INDEX idx_profiles_academic_year ON profiles(academic_year);
CREATE INDEX idx_profiles_has_returned ON profiles(has_returned_from_erasmus);
CREATE INDEX idx_profiles_looking_for_roommate ON profiles(looking_for_roommate);

-- GIN index for array searches (interests, languages)
CREATE INDEX idx_profiles_interests ON profiles USING GIN(interests);
CREATE INDEX idx_profiles_languages ON profiles USING GIN(languages);

-- Full-text search index for bio
CREATE INDEX idx_profiles_bio_fulltext ON profiles USING GIN(to_tsvector('english', COALESCE(bio, '')));

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE profiles IS 'User profiles with Erasmus information for matching algorithm';
COMMENT ON COLUMN profiles.user_id IS 'MongoDB ObjectId from main auth database';
COMMENT ON COLUMN profiles.interests IS 'Array of user interests for matching';
COMMENT ON COLUMN profiles.languages IS 'Array of languages user speaks';

