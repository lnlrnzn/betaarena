const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  console.log('=== Deep Dive: Portfolio Value Stagnation Analysis ===\n');

  // Get DeepSeek snapshots from last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data: snapshots, error } = await supabase
    .from('portfolio_snapshots')
    .select('*')
    .eq('agent_id', '32c614c8-c36b-49a6-abd1-a36620dfd359') // DeepSeek V3
    .gte('timestamp', tenMinutesAgo)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${snapshots.length} snapshots for DeepSeek V3 in last 10 minutes\n`);

  // Check for exact duplicates
  const values = snapshots.map(s => s.total_portfolio_value_usd);
  const uniqueValues = [...new Set(values)];

  console.log(`Unique values: ${uniqueValues.length}`);
  console.log(`Total snapshots: ${values.length}`);

  if (uniqueValues.length === 1) {
    console.log('\n🔴 VALUES ARE COMPLETELY STAGNANT - Same value repeated:\n');
    console.log(`   Value: $${uniqueValues[0].toFixed(2)}`);
  } else {
    console.log('\n✅ Values are changing (not stagnant):\n');
    uniqueValues.slice(0, 10).forEach(v => console.log(`   $${v.toFixed(2)}`));
  }

  console.log('\n=== Last 20 Snapshots (with exact timestamps) ===');
  snapshots.slice(0, 20).forEach(s => {
    const time = new Date(s.timestamp).toISOString();
    console.log(`${time}: $${s.total_portfolio_value_usd.toFixed(2)} (SOL: ${s.total_portfolio_value_sol.toFixed(4)})`);
  });

  // Check if timestamps are updating frequently
  console.log('\n=== Update Frequency Check ===');
  if (snapshots.length >= 2) {
    const latest = new Date(snapshots[0].timestamp);
    const previous = new Date(snapshots[1].timestamp);
    const diffSeconds = (latest - previous) / 1000;
    console.log(`Time between last two snapshots: ${diffSeconds} seconds`);

    if (diffSeconds > 120) {
      console.log('⚠️  WARNING: Updates are slow (> 2 minutes apart)');
    } else {
      console.log('✅ Updates are frequent');
    }
  }
})();
