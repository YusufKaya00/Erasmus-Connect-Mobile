-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Public profiles are visible to everyone
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (profile_visibility = 'PUBLIC');

-- Users can view their own profile regardless of visibility
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can view profiles they have matches with
CREATE POLICY "Users can view matched profiles"
  ON profiles FOR SELECT
  USING (
    profile_visibility = 'MATCHES_ONLY'
    AND (
      EXISTS (
        SELECT 1 FROM matches
        WHERE (matches.user_from_id = current_setting('request.jwt.claims', true)::json->>'sub' 
               AND matches.user_to_id = profiles.user_id)
           OR (matches.user_to_id = current_setting('request.jwt.claims', true)::json->>'sub' 
               AND matches.user_from_id = profiles.user_id)
      )
    )
  );

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================
-- COUNTRIES POLICIES
-- ============================================

-- Everyone can view active countries
CREATE POLICY "Active countries are viewable by everyone"
  ON countries FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- MATCHES POLICIES
-- ============================================

-- Users can view their own matches
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING (
    user_from_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user_to_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Users can update matches they're part of (for status changes)
CREATE POLICY "Users can update their matches"
  ON matches FOR UPDATE
  USING (
    user_from_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user_to_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  WITH CHECK (
    user_from_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user_to_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

-- Function to check if user has completed profile
CREATE OR REPLACE FUNCTION has_completed_profile(p_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = p_user_id
      AND first_name IS NOT NULL
      AND last_name IS NOT NULL
      AND destination_country_id IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if two users are matched
CREATE OR REPLACE FUNCTION are_users_matched(p_user_id_1 TEXT, p_user_id_2 TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM matches
    WHERE (user_from_id = p_user_id_1 AND user_to_id = p_user_id_2)
       OR (user_from_id = p_user_id_2 AND user_to_id = p_user_id_1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- REALTIME PUBLICATION
-- ============================================

-- Enable realtime for matches table
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

COMMENT ON POLICY "Public profiles are viewable by everyone" ON profiles 
  IS 'Allows anyone to view profiles with PUBLIC visibility';

COMMENT ON POLICY "Users can view matched profiles" ON profiles 
  IS 'Allows users to view profiles they have been matched with';

COMMENT ON POLICY "Users can view their own matches" ON matches 
  IS 'Users can only see matches they are part of';

