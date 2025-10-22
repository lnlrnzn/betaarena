-- Enable Row Level Security on agent_decisions table
ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for real-time subscriptions)
-- This matches the pattern used for other tables like agent_activities, trades, etc.
CREATE POLICY "Allow public read access to agent_decisions"
ON agent_decisions
FOR SELECT
TO public
USING (true);

-- Optional: Add insert policy if you want to allow inserts from the client
-- For now, we only need read access for the real-time subscriptions
-- Inserts will happen via n8n webhook using service role key

-- Grant SELECT permission to anon role (used by Supabase client)
GRANT SELECT ON agent_decisions TO anon;
GRANT SELECT ON agent_decisions TO authenticated;

-- Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE agent_decisions;

-- Add comment
COMMENT ON POLICY "Allow public read access to agent_decisions" ON agent_decisions IS 'Allows public read access for real-time subscriptions and queries';
