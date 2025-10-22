-- Migration: Delete all portfolio snapshots to start fresh after DeepSeek migration
-- Description: Remove all existing portfolio snapshots so the cron can rebuild them

-- Delete all portfolio snapshots
DELETE FROM portfolio_snapshots;

-- Verify deletion
SELECT COUNT(*) as remaining_snapshots FROM portfolio_snapshots;
