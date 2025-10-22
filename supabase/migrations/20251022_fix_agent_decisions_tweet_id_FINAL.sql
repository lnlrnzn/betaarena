-- =====================================================
-- COPY AND PASTE THIS INTO SUPABASE SQL EDITOR
-- =====================================================
-- Migration: Fix agent_decisions to accept Twitter IDs
-- Issue: tweet_id was UUID, but Twitter IDs are text like "1979128985154900161"
-- Solution: Drop foreign key, change to TEXT
-- =====================================================

-- Step 1: Drop the foreign key constraint (this was blocking the type change)
ALTER TABLE agent_decisions DROP CONSTRAINT IF EXISTS agent_decisions_tweet_id_fkey;

-- Step 2: Change tweet_id from UUID to TEXT
ALTER TABLE agent_decisions
ALTER COLUMN tweet_id TYPE TEXT
USING tweet_id::TEXT;

-- Step 3: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_agent_decisions_tweet_id ON agent_decisions(tweet_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_agent_id ON agent_decisions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_created_at ON agent_decisions(created_at DESC);

-- Step 4: Verify the fix worked
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'agent_decisions'
ORDER BY ordinal_position;
