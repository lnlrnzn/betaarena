import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('team_declarations')
    .select('twitter_username, tweet_text, tweet_id, declared_at')
    .order('declared_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Latest 5 team declarations in DB:\n');
  data?.forEach((d, i) => {
    console.log(`${i+1}. @${d.twitter_username} (${d.declared_at})`);
    console.log(`   Tweet ID: ${d.tweet_id}`);
    console.log(`   Text: ${d.tweet_text}`);
    console.log('');
  });
}

main();
