-- =====================================================
-- MIGRATION: Add Agent Elimination Tracking
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add elimination tracking columns to agents table
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS is_eliminated BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS eliminated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS elimination_order INTEGER;

-- Create index for efficient queries on eliminated status
CREATE INDEX IF NOT EXISTS idx_agents_elimination ON agents(is_eliminated, elimination_order);

-- Mark GPT-5 as the first eliminated agent
UPDATE agents
SET
  is_eliminated = TRUE,
  eliminated_at = NOW(),
  elimination_order = 1
WHERE id = '0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc';

-- Add comments for documentation
COMMENT ON COLUMN agents.is_eliminated IS 'Whether this agent has been eliminated from the current competition';
COMMENT ON COLUMN agents.eliminated_at IS 'Timestamp when the agent was eliminated';
COMMENT ON COLUMN agents.elimination_order IS 'Order of elimination (1st, 2nd, 3rd, etc.)';

-- Verify the change
SELECT id, name, is_eliminated, eliminated_at, elimination_order FROM agents ORDER BY name;
