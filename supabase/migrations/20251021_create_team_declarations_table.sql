-- Create team_declarations table to track user team declarations via Twitter
CREATE TABLE IF NOT EXISTS team_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cycle tracking
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE NOT NULL,

  -- Agent they joined (matches AGENTS constant IDs)
  agent_id TEXT NOT NULL,

  -- Twitter data
  tweet_id TEXT NOT NULL,
  twitter_username TEXT NOT NULL,
  twitter_user_id TEXT NOT NULL,
  twitter_name TEXT,
  profile_picture TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,

  -- Tweet details
  tweet_text TEXT NOT NULL,
  tweet_url TEXT,
  declared_at TIMESTAMPTZ NOT NULL,

  -- Full Twitter API response (JSONB for flexibility)
  tweet_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- UNIQUE CONSTRAINT: One username per cycle (blocks multi-team declarations)
  CONSTRAINT unique_user_per_cycle UNIQUE (cycle_id, twitter_username)
);

-- Indexes for fast queries
CREATE INDEX idx_team_declarations_cycle_agent ON team_declarations(cycle_id, agent_id);
CREATE INDEX idx_team_declarations_declared_at ON team_declarations(cycle_id, declared_at DESC);
CREATE INDEX idx_team_declarations_username ON team_declarations(twitter_username);
CREATE INDEX idx_team_declarations_tweet_id ON team_declarations(tweet_id);

-- Enable RLS
ALTER TABLE team_declarations ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read team declarations
CREATE POLICY "Team declarations are viewable by everyone"
  ON team_declarations FOR SELECT
  USING (true);

-- Policy: Only service role can insert (via n8n with service key)
-- Service role bypasses RLS, so no explicit insert policy needed
