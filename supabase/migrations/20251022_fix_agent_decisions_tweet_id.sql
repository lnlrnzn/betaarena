-- Migration: Fix agent_decisions table to accept Twitter/X post IDs
-- Description: Twitter IDs are 19-digit snowflake IDs (e.g., "1979128985154900161"), not UUIDs
-- This migration changes tweet_id from UUID to TEXT to fix n8n insertion errors

-- First, check if the table exists and what the current structure is
DO $$
BEGIN
  -- Check if agent_decisions table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agent_decisions') THEN

    -- Check if tweet_id column exists and its type
    IF EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_name = 'agent_decisions'
        AND column_name = 'tweet_id'
        AND data_type = 'uuid'
    ) THEN
      -- tweet_id is UUID, needs to be changed to TEXT
      RAISE NOTICE 'Changing tweet_id from UUID to TEXT...';

      -- Drop any constraints or indexes on tweet_id first
      ALTER TABLE agent_decisions DROP CONSTRAINT IF EXISTS agent_decisions_tweet_id_key;

      -- Change column type from UUID to TEXT
      ALTER TABLE agent_decisions ALTER COLUMN tweet_id TYPE TEXT USING tweet_id::TEXT;

      RAISE NOTICE 'Successfully changed tweet_id to TEXT type';
    ELSE
      RAISE NOTICE 'tweet_id is already TEXT or does not exist';
    END IF;

    -- Also check if there's a tweet_reference column that might be UUID
    IF EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_name = 'agent_decisions'
        AND column_name = 'tweet_reference'
        AND data_type = 'uuid'
    ) THEN
      RAISE NOTICE 'Changing tweet_reference from UUID to TEXT...';
      ALTER TABLE agent_decisions ALTER COLUMN tweet_reference TYPE TEXT USING tweet_reference::TEXT;
      RAISE NOTICE 'Successfully changed tweet_reference to TEXT type';
    END IF;

  ELSE
    RAISE NOTICE 'agent_decisions table does not exist - skipping migration';
  END IF;
END $$;

-- Add indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_agent_decisions_tweet_id ON agent_decisions(tweet_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_agent_id ON agent_decisions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_created_at ON agent_decisions(created_at DESC);

-- Verify the final structure
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'agent_decisions'
ORDER BY ordinal_position;
