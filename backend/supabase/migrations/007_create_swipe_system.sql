-- ============================================
-- SWIPE SYSTEM TABLES
-- ============================================

-- Create swipe_actions table
CREATE TABLE IF NOT EXISTS swipe_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL,
  swiped_id UUID NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('LIKE', 'PASS')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('ROOMMATE', 'MENTOR', 'COMMUNICATION')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_swiper FOREIGN KEY (swiper_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_swiped FOREIGN KEY (swiped_id) REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Unique constraint: one action per user pair per category
  UNIQUE(swiper_id, swiped_id, category)
);

-- Create matches table (mutual likes)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('ROOMMATE', 'MENTOR', 'COMMUNICATION')),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_user1 FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_user2 FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Unique constraint: one match per user pair per category
  UNIQUE(user1_id, user2_id, category)
);

-- Create connections table (for communication)
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  contact_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  CONSTRAINT fk_conn_user1 FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_conn_user2 FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_swipe_actions_swiper_id ON swipe_actions(swiper_id);
CREATE INDEX idx_swipe_actions_swiped_id ON swipe_actions(swiped_id);
CREATE INDEX idx_swipe_actions_category ON swipe_actions(category);
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_matches_category ON matches(category);
CREATE INDEX idx_connections_match_id ON connections(match_id);
CREATE INDEX idx_connections_user1_id ON connections(user1_id);
CREATE INDEX idx_connections_user2_id ON connections(user2_id);

-- Create trigger for updated_at
CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE swipe_actions IS 'User swipe actions (like/pass) for matching';
COMMENT ON TABLE matches IS 'Mutual matches between users';
COMMENT ON TABLE connections IS 'Connection requests after mutual matches';
