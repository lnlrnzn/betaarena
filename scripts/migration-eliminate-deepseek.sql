-- =====================================================
-- MIGRATION: Mark DeepSeek as Eliminated (3rd Agent)
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- Mark DeepSeek V3 as the third eliminated agent
UPDATE agents
SET
  is_eliminated = TRUE,
  eliminated_at = NOW(),
  elimination_order = 3
WHERE id = '32c614c8-c36b-49a6-abd1-a36620dfd359';

-- Verify the change
SELECT id, name, is_eliminated, eliminated_at, elimination_order
FROM agents
WHERE is_eliminated = TRUE
ORDER BY elimination_order;
