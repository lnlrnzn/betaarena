-- Enable Realtime Broadcast for database changes
-- This migration sets up triggers to broadcast changes via Realtime Broadcast
-- instead of using Postgres Changes (which requires replication access)

-- ============================================================================
-- Step 1: Enable RLS on realtime.messages and create policies
-- ============================================================================

-- Enable Row Level Security on realtime.messages
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to receive broadcasts
CREATE POLICY "Allow authenticated users to receive broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow anon users to receive broadcasts
CREATE POLICY "Allow anon users to receive broadcasts"
ON realtime.messages
FOR SELECT
TO anon
USING (true);

-- Grant SELECT permission to anon and authenticated roles
GRANT SELECT ON realtime.messages TO anon;
GRANT SELECT ON realtime.messages TO authenticated;

-- ============================================================================
-- Step 2: Create trigger functions for each table
-- ============================================================================

-- Trigger function for portfolio_snapshots
CREATE OR REPLACE FUNCTION public.broadcast_portfolio_snapshot_changes()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'portfolio-snapshots',  -- topic name
    TG_OP,                  -- event (INSERT, UPDATE, DELETE)
    TG_OP,                  -- operation
    TG_TABLE_NAME,          -- table name
    TG_TABLE_SCHEMA,        -- schema name
    NEW,                    -- new record
    OLD                     -- old record (NULL for INSERT)
  );
  RETURN NEW;
END;
$$;

-- Trigger function for trades
CREATE OR REPLACE FUNCTION public.broadcast_trade_changes()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'trades',              -- topic name
    TG_OP,                 -- event
    TG_OP,                 -- operation
    TG_TABLE_NAME,         -- table name
    TG_TABLE_SCHEMA,       -- schema name
    NEW,                   -- new record
    OLD                    -- old record
  );
  RETURN NEW;
END;
$$;

-- Trigger function for agent_activities
CREATE OR REPLACE FUNCTION public.broadcast_agent_activity_changes()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'agent-activities',    -- topic name
    TG_OP,                 -- event
    TG_OP,                 -- operation
    TG_TABLE_NAME,         -- table name
    TG_TABLE_SCHEMA,       -- schema name
    NEW,                   -- new record
    OLD                    -- old record
  );
  RETURN NEW;
END;
$$;

-- Trigger function for tweets
CREATE OR REPLACE FUNCTION public.broadcast_tweet_changes()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'tweets',              -- topic name
    TG_OP,                 -- event
    TG_OP,                 -- operation
    TG_TABLE_NAME,         -- table name
    TG_TABLE_SCHEMA,       -- schema name
    NEW,                   -- new record
    OLD                    -- old record
  );
  RETURN NEW;
END;
$$;

-- ============================================================================
-- Step 3: Create triggers on each table
-- ============================================================================

-- Trigger for portfolio_snapshots
DROP TRIGGER IF EXISTS broadcast_portfolio_snapshot_changes_trigger ON public.portfolio_snapshots;
CREATE TRIGGER broadcast_portfolio_snapshot_changes_trigger
AFTER INSERT OR UPDATE OR DELETE
ON public.portfolio_snapshots
FOR EACH ROW
EXECUTE FUNCTION public.broadcast_portfolio_snapshot_changes();

-- Trigger for trades
DROP TRIGGER IF EXISTS broadcast_trade_changes_trigger ON public.trades;
CREATE TRIGGER broadcast_trade_changes_trigger
AFTER INSERT OR UPDATE OR DELETE
ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.broadcast_trade_changes();

-- Trigger for agent_activities
DROP TRIGGER IF EXISTS broadcast_agent_activity_changes_trigger ON public.agent_activities;
CREATE TRIGGER broadcast_agent_activity_changes_trigger
AFTER INSERT OR UPDATE OR DELETE
ON public.agent_activities
FOR EACH ROW
EXECUTE FUNCTION public.broadcast_agent_activity_changes();

-- Trigger for tweets
DROP TRIGGER IF EXISTS broadcast_tweet_changes_trigger ON public.tweets;
CREATE TRIGGER broadcast_tweet_changes_trigger
AFTER INSERT OR UPDATE OR DELETE
ON public.tweets
FOR EACH ROW
EXECUTE FUNCTION public.broadcast_tweet_changes();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON FUNCTION public.broadcast_portfolio_snapshot_changes() IS
'Broadcasts portfolio snapshot changes via Realtime Broadcast';

COMMENT ON FUNCTION public.broadcast_trade_changes() IS
'Broadcasts trade changes via Realtime Broadcast';

COMMENT ON FUNCTION public.broadcast_agent_activity_changes() IS
'Broadcasts agent activity changes via Realtime Broadcast';

COMMENT ON FUNCTION public.broadcast_tweet_changes() IS
'Broadcasts tweet changes via Realtime Broadcast';
