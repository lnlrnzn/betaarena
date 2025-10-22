-- Drop the existing agent_decisions table
DROP TABLE IF EXISTS agent_decisions CASCADE;

-- Recreate agent_decisions table without check constraints
CREATE TABLE agent_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id TEXT,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  amount_sol NUMERIC,
  reasoning TEXT NOT NULL,
  exit_plan TEXT,
  confidence_score NUMERIC,
  decided_at TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_decisions_tweet_id ON agent_decisions(tweet_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_agent_id ON agent_decisions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_created_at ON agent_decisions(created_at DESC);

-- Add comment
COMMENT ON TABLE agent_decisions IS 'Stores agent trading decisions without validation constraints';
