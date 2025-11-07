-- ============================================
-- MATCH ALGORITHM FUNCTION v2
-- (MongoDB ObjectId Compatible - destination_country_id as TEXT)
-- ============================================

DROP FUNCTION IF EXISTS find_matches(TEXT, INTEGER, DECIMAL);

CREATE OR REPLACE FUNCTION find_matches(
  p_user_id TEXT,
  p_limit INTEGER DEFAULT 20,
  p_min_score DECIMAL DEFAULT 20.0
)
RETURNS TABLE (
  profile_id UUID,
  user_id TEXT,
  first_name VARCHAR,
  last_name VARCHAR,
  photo_url TEXT,
  bio TEXT,
  destination_country_id TEXT,
  destination_city VARCHAR,
  destination_university VARCHAR,
  academic_term academic_term_enum,
  academic_year VARCHAR,
  interests TEXT[],
  languages TEXT[],
  has_returned_from_erasmus BOOLEAN,
  looking_for_roommate BOOLEAN,
  match_score DECIMAL,
  score_breakdown JSONB
) AS $$
DECLARE
  v_user_profile RECORD;
BEGIN
  -- Get current user's profile
  SELECT * INTO v_user_profile
  FROM profiles
  WHERE profiles.user_id = p_user_id;
  
  IF v_user_profile IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Find and score matches
  RETURN QUERY
  SELECT 
    p.id as profile_id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.photo_url,
    p.bio,
    p.destination_country_id,
    p.destination_city,
    p.destination_university,
    p.academic_term,
    p.academic_year,
    p.interests,
    p.languages,
    p.has_returned_from_erasmus,
    p.looking_for_roommate,
    
    -- Calculate total match score
    (
      -- Base score for same destination country (30 points)
      CASE 
        WHEN p.destination_country_id = v_user_profile.destination_country_id 
        THEN 30.0 
        ELSE 0.0 
      END +
      
      -- Same city bonus (15 points)
      CASE 
        WHEN p.destination_city = v_user_profile.destination_city 
          AND p.destination_city IS NOT NULL
        THEN 15.0 
        ELSE 0.0 
      END +
      
      -- Interest overlap (5 points per common interest, max 25)
      LEAST(
        COALESCE(CARDINALITY(p.interests & v_user_profile.interests), 0) * 5.0,
        25.0
      ) +
      
      -- Language overlap (10 points per common language, max 30)
      LEAST(
        COALESCE(CARDINALITY(p.languages & v_user_profile.languages), 0) * 10.0,
        30.0
      ) +
      
      -- Same academic term (20 points)
      CASE 
        WHEN p.academic_term = v_user_profile.academic_term 
          AND p.academic_term IS NOT NULL
        THEN 20.0 
        ELSE 0.0 
      END +
      
      -- Same academic year (10 points)
      CASE 
        WHEN p.academic_year = v_user_profile.academic_year 
          AND p.academic_year IS NOT NULL
        THEN 10.0 
        ELSE 0.0 
      END +
      
      -- Both looking for roommate (15 points)
      CASE 
        WHEN p.looking_for_roommate = TRUE 
          AND v_user_profile.looking_for_roommate = TRUE
        THEN 15.0 
        ELSE 0.0 
      END +
      
      -- Returned from Erasmus mentor bonus (20 points if one has returned)
      CASE 
        WHEN p.has_returned_from_erasmus = TRUE 
          AND v_user_profile.has_returned_from_erasmus = FALSE
        THEN 20.0 
        ELSE 0.0 
      END +
      
      -- Same field of study (15 points)
      CASE 
        WHEN p.field_of_study = v_user_profile.field_of_study 
          AND p.field_of_study IS NOT NULL
        THEN 15.0 
        ELSE 0.0 
      END
      
    )::DECIMAL(5,2) as match_score,
    
    -- Score breakdown as JSON
    jsonb_build_object(
      'destination_match', 
        p.destination_country_id = v_user_profile.destination_country_id,
      'destination_score',
        CASE WHEN p.destination_country_id = v_user_profile.destination_country_id THEN 30 ELSE 0 END,
      'city_match',
        p.destination_city = v_user_profile.destination_city,
      'city_score',
        CASE WHEN p.destination_city = v_user_profile.destination_city AND p.destination_city IS NOT NULL THEN 15 ELSE 0 END,
      'common_interests',
        COALESCE(p.interests & v_user_profile.interests, ARRAY[]::TEXT[]),
      'interest_score',
        LEAST(COALESCE(CARDINALITY(p.interests & v_user_profile.interests), 0) * 5, 25),
      'common_languages',
        COALESCE(p.languages & v_user_profile.languages, ARRAY[]::TEXT[]),
      'language_score',
        LEAST(COALESCE(CARDINALITY(p.languages & v_user_profile.languages), 0) * 10, 30),
      'academic_term_match',
        p.academic_term = v_user_profile.academic_term,
      'academic_term_score',
        CASE WHEN p.academic_term = v_user_profile.academic_term AND p.academic_term IS NOT NULL THEN 20 ELSE 0 END,
      'academic_year_match',
        p.academic_year = v_user_profile.academic_year,
      'academic_year_score',
        CASE WHEN p.academic_year = v_user_profile.academic_year AND p.academic_year IS NOT NULL THEN 10 ELSE 0 END,
      'roommate_score',
        CASE WHEN p.looking_for_roommate = TRUE AND v_user_profile.looking_for_roommate = TRUE THEN 15 ELSE 0 END,
      'mentor_score',
        CASE WHEN p.has_returned_from_erasmus = TRUE AND v_user_profile.has_returned_from_erasmus = FALSE THEN 20 ELSE 0 END,
      'field_of_study_match',
        p.field_of_study = v_user_profile.field_of_study,
      'field_of_study_score',
        CASE WHEN p.field_of_study = v_user_profile.field_of_study AND p.field_of_study IS NOT NULL THEN 15 ELSE 0 END
    ) as score_breakdown
    
  FROM profiles p
  WHERE 
    p.user_id != p_user_id
    AND p.profile_visibility = 'PUBLIC'
    AND p.destination_country_id = v_user_profile.destination_country_id
    -- Ensure we have enough common ground
    AND (
      COALESCE(CARDINALITY(p.interests & v_user_profile.interests), 0) > 0
      OR COALESCE(CARDINALITY(p.languages & v_user_profile.languages), 0) > 0
      OR p.academic_term = v_user_profile.academic_term
      OR p.looking_for_roommate = TRUE
    )
  HAVING 
    -- Only return matches above minimum score
    (
      CASE WHEN p.destination_country_id = v_user_profile.destination_country_id THEN 30.0 ELSE 0.0 END +
      CASE WHEN p.destination_city = v_user_profile.destination_city AND p.destination_city IS NOT NULL THEN 15.0 ELSE 0.0 END +
      LEAST(COALESCE(CARDINALITY(p.interests & v_user_profile.interests), 0) * 5.0, 25.0) +
      LEAST(COALESCE(CARDINALITY(p.languages & v_user_profile.languages), 0) * 10.0, 30.0) +
      CASE WHEN p.academic_term = v_user_profile.academic_term AND p.academic_term IS NOT NULL THEN 20.0 ELSE 0.0 END +
      CASE WHEN p.academic_year = v_user_profile.academic_year AND p.academic_year IS NOT NULL THEN 10.0 ELSE 0.0 END +
      CASE WHEN p.looking_for_roommate = TRUE AND v_user_profile.looking_for_roommate = TRUE THEN 15.0 ELSE 0.0 END +
      CASE WHEN p.has_returned_from_erasmus = TRUE AND v_user_profile.has_returned_from_erasmus = FALSE THEN 20.0 ELSE 0.0 END +
      CASE WHEN p.field_of_study = v_user_profile.field_of_study AND p.field_of_study IS NOT NULL THEN 15.0 ELSE 0.0 END
    ) >= p_min_score
  ORDER BY match_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_matches IS 'Advanced matching algorithm. Compatible with MongoDB ObjectId for user_id and destination_country_id.';

