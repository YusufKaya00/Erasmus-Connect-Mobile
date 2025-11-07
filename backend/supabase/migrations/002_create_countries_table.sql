-- ============================================
-- COUNTRIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  continent VARCHAR(50) NOT NULL,
  
  -- Geographic Data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Additional Information
  flag VARCHAR(10),
  timezone VARCHAR(100),
  currency VARCHAR(10),
  languages TEXT[] DEFAULT '{}',
  description TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to profiles
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_destination_country
  FOREIGN KEY (destination_country_id)
  REFERENCES countries(id)
  ON DELETE SET NULL;

-- Create indexes
CREATE INDEX idx_countries_code ON countries(code);
CREATE INDEX idx_countries_continent ON countries(continent);
CREATE INDEX idx_countries_is_active ON countries(is_active);
CREATE INDEX idx_countries_name ON countries(name);

-- GIN index for languages array
CREATE INDEX idx_countries_languages ON countries USING GIN(languages);

-- Update timestamp trigger
CREATE TRIGGER countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE countries IS 'Countries information for Erasmus destinations';

