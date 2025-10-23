import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('team_declarations')
    .select('twitter_username, tweet_text, tweet_id, declared_at, agent_id')
    .order('declared_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('='.repeat(70));
  console.log(`ALLE ${data.length} TEAM DECLARATIONS IN DER DATENBANK`);
  console.log('='.repeat(70));
  console.log('');

  // Group by date
  const byDate: Record<string, any[]> = {};
  data?.forEach(d => {
    const date = d.declared_at.split('T')[0];
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(d);
  });

  Object.entries(byDate)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .forEach(([date, declarations]) => {
      console.log(`\n📅 ${date} (${declarations.length} declarations)`);
      console.log('-'.repeat(70));
      declarations.forEach((d, i) => {
        const time = new Date(d.declared_at).toLocaleTimeString('de-DE');
        const agentName =
          d.agent_id === 'd8d17db6-eab8-4400-8632-1a549b3cb290' ? 'Claude' :
          d.agent_id === '0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc' ? 'GPT-5' :
          d.agent_id === 'a73916de-5fa8-4085-906a-e3f7358d0e9e' ? 'Gemini' :
          d.agent_id === 'd8ed8ce7-ea5b-48dd-a4ab-22488da3f2ce' ? 'Grok' :
          d.agent_id === 'bd389a97-ed1b-47b3-be23-17063c662327' ? 'Qwen' :
          d.agent_id === '272ec813-4b15-4556-a8f9-33e5bee817f0' ? 'GLM' :
          d.agent_id === '32c614c8-c36b-49a6-abd1-a36620dfd359' ? 'DeepSeek' :
          'Unknown';

        console.log(`  ${i+1}. [${time}] @${d.twitter_username} → Team ${agentName}`);
        console.log(`     Tweet: ${d.tweet_text.substring(0, 80)}...`);
        console.log(`     ID: ${d.tweet_id}`);
      });
    });

  console.log('\n' + '='.repeat(70));
}

main();
