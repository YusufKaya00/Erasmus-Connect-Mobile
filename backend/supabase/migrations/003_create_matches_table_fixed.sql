-- ============================================
-- MATCHES TABLE (MongoDB ObjectId Compatible)
-- ============================================

-- Create match status enum
CREATE TYPE match_status_enum AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Match Parties (TEXT for MongoDB ObjectId)
  user_from_id TEXT NOT NULL,
  user_to_id TEXT NOT NULL,
  
  -- Matching Score
  match_score DECIMAL(5, 2) NOT NULL,
  score_breakdown JSONB,
  
  -- Status
  status match_status_enum DEFAULT 'PENDING',
  
  -- Contact Sharing
  contact_shared_by_from BOOLEAN DEFAULT FALSE,
  contact_shared_by_to BOOLEAN DEFAULT FALSE,
  contact_shared_at TIMESTAMP WITH TIME ZONE,
  
  -- Messages
  last_message_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique match between two users
  CONSTRAINT unique_match UNIQUE(user_from_id, user_to_id),
  
  -- Ensure users don't match with themselves
  CONSTRAINT different_users CHECK (user_from_id != user_to_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_contacts_user_from ON contacts(user_from_id);
CREATE INDEX idx_contacts_user_to ON contacts(user_to_id);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_score ON contacts(match_score DESC);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);

-- Composite index for user's contacts
CREATE INDEX idx_contacts_user_from_status ON contacts(user_from_id, status);
CREATE INDEX idx_contacts_user_to_status ON contacts(user_to_id, status);

-- GIN index for score_breakdown JSONB
CREATE INDEX idx_contacts_score_breakdown ON contacts USING GIN(score_breakdown);

-- Update timestamp trigger
CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE contacts IS 'User contact results with scoring algorithm';
COMMENT ON COLUMN contacts.user_from_id IS 'MongoDB ObjectId of user who initiated contact';
COMMENT ON COLUMN contacts.user_to_id IS 'MongoDB ObjectId of contacted user';
COMMENT ON COLUMN contacts.score_breakdown IS 'JSON breakdown of contact score calculation';

