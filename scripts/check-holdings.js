const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  // Get GPT-5 agent ID
  const gpt5Id = '0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc';

  console.log('=== Latest Portfolio Holdings for GPT-5 ===\n');

  const { data: holdings, error } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .eq('agent_id', gpt5Id)
    .order('timestamp', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (holdings.length === 0) {
    console.log('No holdings found');
    return;
  }

  const latestTime = holdings[0].timestamp;
  const latestHoldings = holdings.filter(h => h.timestamp === latestTime);

  console.log('Timestamp:', new Date(latestTime).toISOString());
  console.log('\nHoldings:');

  let total = 0;
  latestHoldings.forEach(h => {
    total += h.value_in_usd;
    const symbol = h.token_symbol || 'UNKNOWN';
    console.log(`${symbol.padEnd(15)} $${h.value_in_usd.toFixed(2).padStart(10)}`);
  });

  console.log('\nTotal from holdings: $' + total.toFixed(2));

  // Get portfolio snapshot for same time
  const { data: snapshot } = await supabase
    .from('portfolio_snapshots')
    .select('*')
    .eq('agent_id', gpt5Id)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (snapshot) {
    console.log('\nPortfolio Snapshot:');
    console.log('Total (stored):      $' + snapshot.total_portfolio_value_usd.toFixed(2));
    console.log('Difference:          $' + (total - snapshot.total_portfolio_value_usd).toFixed(2));
  }
})();
