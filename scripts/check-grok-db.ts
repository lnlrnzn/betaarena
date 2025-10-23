import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('team_declarations')
    .select('twitter_username, tweet_text, tweet_id')
    .eq('agent_id', 'd8ed8ce7-ea5b-48dd-a4ab-22488da3f2ce')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Grok declarations in DB: ${data?.length}\n`);
  data?.forEach((d, i) => {
    console.log(`${i+1}. @${d.twitter_username}`);
    console.log(`   Tweet: ${d.tweet_text.substring(0,100)}...`);
    console.log(`   ID: ${d.tweet_id}\n`);
  });
}

main();
