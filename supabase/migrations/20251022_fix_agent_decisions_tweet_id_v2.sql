-- Migration: Fix agent_decisions table to accept Twitter/X post IDs
-- Description: Twitter IDs are 19-digit snowflake IDs (e.g., "1979128985154900161"), not UUIDs
-- This migration fixes the foreign key constraint issue

-- First, drop the foreign key constraint
ALTER TABLE agent_decisions DROP CONSTRAINT IF EXISTS agent_decisions_tweet_id_fkey;

-- Now change tweet_id from UUID to TEXT
ALTER TABLE agent_decisions ALTER COLUMN tweet_id TYPE TEXT USING tweet_id::TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_decisions_tweet_id ON agent_decisions(tweet_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_agent_id ON agent_decisions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_created_at ON agent_decisions(created_at DESC);

-- Verify the change
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'agent_decisions'
  AND column_name = 'tweet_id';
