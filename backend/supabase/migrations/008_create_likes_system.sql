-- ============================================
-- SIMPLE LIKES SYSTEM
-- ============================================

-- Create likes table (simple like system)
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id TEXT NOT NULL, -- MongoDB ObjectId
  liked_id TEXT NOT NULL, -- MongoDB ObjectId
  category VARCHAR(20) NOT NULL CHECK (category IN ('ROOMMATE', 'MENTOR', 'COMMUNICATION')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_liker FOREIGN KEY (liker_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_liked FOREIGN KEY (liked_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Unique constraint: one like per user pair per category
  UNIQUE(liker_id, liked_id, category)
);

-- Create indexes for performance
CREATE INDEX idx_likes_liker_id ON likes(liker_id);
CREATE INDEX idx_likes_liked_id ON likes(liked_id);
CREATE INDEX idx_likes_category ON likes(category);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

-- Add comments
COMMENT ON TABLE likes IS 'Simple like system for user preferences';
COMMENT ON COLUMN likes.liker_id IS 'MongoDB ObjectId of user who liked';
COMMENT ON COLUMN likes.liked_id IS 'MongoDB ObjectId of liked user';
COMMENT ON COLUMN likes.category IS 'Category of the like (ROOMMATE, MENTOR, COMMUNICATION)';