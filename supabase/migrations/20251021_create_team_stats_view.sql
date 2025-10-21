-- Create view for pre-calculated team stats (performance optimization)
CREATE OR REPLACE VIEW team_stats AS
SELECT
  td.cycle_id,
  td.agent_id,
  COUNT(*) as total_members,
  COALESCE(SUM(td.followers_count), 0) as total_followers,
  COALESCE(SUM(td.following_count), 0) as total_following,
  MAX(td.declared_at) as latest_declaration,
  MIN(td.declared_at) as first_declaration
FROM team_declarations td
GROUP BY td.cycle_id, td.agent_id;

-- Grant read access to anon and authenticated users
GRANT SELECT ON team_stats TO anon, authenticated;

-- Add comment for documentation
COMMENT ON VIEW team_stats IS 'Pre-calculated aggregate stats per team per cycle for fast queries';
