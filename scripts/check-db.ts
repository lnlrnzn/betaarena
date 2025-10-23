import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error, count } = await supabase
    .from('team_declarations')
    .select('twitter_username, agent_id, declared_at', { count: 'exact' });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Total team declarations in DB:', count);
  console.log('\nSample (first 5):');
  data?.slice(0, 5).forEach((d, i) => {
    console.log(`${i+1}. @${d.twitter_username} - Agent: ${d.agent_id.substring(0, 8)}... - ${d.declared_at}`);
  });
}

main();
