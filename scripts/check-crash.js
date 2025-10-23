const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  console.log('=== Checking for portfolio value crashes to $0 ===\n');

  // Get all snapshots from the last 30 minutes
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data: snapshots, error } = await supabase
    .from('portfolio_snapshots')
    .select('*, agents(name)')
    .gte('timestamp', thirtyMinutesAgo)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${snapshots.length} snapshots in last 30 minutes\n`);

  // Group by agent and look for crashes
  const agents = {};
  snapshots.forEach(s => {
    const agentName = s.agents.name;
    if (!agents[agentName]) agents[agentName] = [];
    agents[agentName].push({
      timestamp: new Date(s.timestamp).toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }),
      value: s.total_portfolio_value_usd
    });
  });

  // Check each agent for crashes to 0 or near-0
  Object.keys(agents).forEach(agentName => {
    const values = agents[agentName];
    const crashes = values.filter(v => v.value < 100); // Less than $100 is suspicious

    if (crashes.length > 0) {
      console.log(`\n🔴 ${agentName} - CRASH DETECTED:`);
      crashes.forEach(c => {
        console.log(`   ${c.timestamp} UTC: $${c.value.toFixed(2)}`);
      });

      // Show context (values before and after)
      console.log(`\n   Recent history:`);
      values.slice(0, 10).forEach(v => {
        const marker = v.value < 100 ? ' ⚠️ ' : '    ';
        console.log(`${marker}${v.timestamp} UTC: $${v.value.toFixed(2)}`);
      });
    }
  });

  // Look for DeepSeek specifically
  console.log('\n=== DeepSeek V3 Detailed History ===');
  const deepseek = snapshots.filter(s => s.agents.name === 'DeepSeek V3').slice(0, 20);
  deepseek.forEach(s => {
    const time = new Date(s.timestamp).toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' });
    const marker = s.total_portfolio_value_usd < 100 ? ' ⚠️ CRASH' : '';
    console.log(`${time} UTC: $${s.total_portfolio_value_usd.toFixed(2)}${marker}`);
  });
})();
