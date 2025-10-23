const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  const { data, error } = await supabase
    .from('portfolio_snapshots')
    .select('agent_id, total_portfolio_value_usd, timestamp, agents(name)')
    .order('timestamp', { ascending: false })
    .limit(14);

  if (error) {
    console.error('Error:', error);
    return;
  }

  data.forEach(row => {
    const time = new Date(row.timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      timeZone: 'UTC'
    });
    console.log(`${row.agents.name.padEnd(20)} $${row.total_portfolio_value_usd.toFixed(2).padStart(10)} at ${time}`);
  });
})();
