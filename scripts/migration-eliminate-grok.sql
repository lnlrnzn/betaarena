-- =====================================================
-- MIGRATION: Mark Grok as Eliminated (2nd Agent)
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- Mark Grok 4 as the second eliminated agent
UPDATE agents
SET
  is_eliminated = TRUE,
  eliminated_at = NOW(),
  elimination_order = 2
WHERE id = 'd8ed8ce7-ea5b-48dd-a4ab-22488da3f2ce';

-- Verify the change
SELECT id, name, is_eliminated, eliminated_at, elimination_order
FROM agents
WHERE is_eliminated = TRUE
ORDER BY elimination_order;
