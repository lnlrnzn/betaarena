-- Create cycles table to track 7-day competition cycles
CREATE TABLE IF NOT EXISTS cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_number INTEGER UNIQUE NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT false,
  winner_agent_id TEXT, -- Agent ID from AGENTS constants
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one cycle should be active at a time
CREATE UNIQUE INDEX idx_cycles_single_active ON cycles(is_active) WHERE is_active = true;

-- Index for querying active cycles
CREATE INDEX idx_cycles_is_active ON cycles(is_active);

-- Index for querying by date
CREATE INDEX idx_cycles_dates ON cycles(start_date, end_date);

-- Enable RLS
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read cycles
CREATE POLICY "Cycles are viewable by everyone"
  ON cycles FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update cycles (via API)
-- (Service role bypasses RLS, so no explicit policy needed)

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cycles_updated_at BEFORE UPDATE ON cycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial cycle (Season 1 - Coming Soon)
INSERT INTO cycles (cycle_number, start_date, end_date, is_active)
VALUES (
  1,
  '2025-11-01 00:00:00+00'::TIMESTAMPTZ, -- Placeholder start date
  '2025-11-08 00:00:00+00'::TIMESTAMPTZ, -- 7 days later
  false -- Not active yet, will be activated manually
);
