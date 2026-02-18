-- Create SAVED_SEARCHES table for storing user search preferences
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL, -- Stores all search filter criteria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_last_used ON saved_searches(last_used DESC);

-- Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own saved searches" ON saved_searches;
DROP POLICY IF EXISTS "Users can create their own saved searches" ON saved_searches;
DROP POLICY IF EXISTS "Users can update their own saved searches" ON saved_searches;
DROP POLICY IF EXISTS "Users can delete their own saved searches" ON saved_searches;

-- RLS Policies
CREATE POLICY "Users can view their own saved searches" ON saved_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved searches" ON saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches" ON saved_searches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches" ON saved_searches
  FOR DELETE USING (auth.uid() = user_id);

