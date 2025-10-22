-- Migration: Reset agent activities and team declarations
-- Description: Delete all agent activities and team declarations to start fresh

-- Delete all team declarations
DELETE FROM team_declarations;

-- Delete all agent activities
DELETE FROM agent_activities;

-- Verify deletions
SELECT
  (SELECT COUNT(*) FROM team_declarations) as remaining_declarations,
  (SELECT COUNT(*) FROM agent_activities) as remaining_activities;
