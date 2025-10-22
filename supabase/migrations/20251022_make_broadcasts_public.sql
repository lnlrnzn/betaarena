-- Make broadcast_changes send to PUBLIC channels instead of private
-- This allows anon users to receive broadcasts without authentication

-- Update trigger function for portfolio_snapshots to use public channels
CREATE OR REPLACE FUNCTION public.broadcast_portfolio_snapshot_changes()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM realtime.send(
    jsonb_build_object(
      'old_record', OLD,
      'record', NEW,
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA
    ),
    TG_OP,                     -- event (INSERT, UPDATE, DELETE)
    'portfolio-snapshots',     -- topic name
    FALSE                       -- PUBLIC channel (not private)
  );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.broadcast_portfolio_snapshot_changes() IS
'Broadcasts portfolio snapshot changes via PUBLIC Realtime channel';
