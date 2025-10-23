const fetchedTweets = require('./twitter-mentions-backup.json');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: dbDeclarations, error } = await supabase
    .from('team_declarations')
    .select('tweet_id, twitter_username, tweet_text, agent_id');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const fetchedTweetMap = new Map(fetchedTweets.map(t => [t.id, t]));

  // Find tweets that are in both
  const inBoth = dbDeclarations.filter(d => fetchedTweetMap.has(d.tweet_id));

  console.log(`Tweets in both DB and fetched: ${inBoth.length}\n`);

  inBoth.forEach((d, i) => {
    const fetchedTweet = fetchedTweetMap.get(d.tweet_id);
    console.log(`${i+1}. @${d.twitter_username}`);
    console.log(`   Agent ID: ${d.agent_id.substring(0, 12)}...`);
    console.log(`   Text in DB: ${d.tweet_text.substring(0, 100)}`);
    console.log(`   Text in API: ${fetchedTweet.text.substring(0, 100)}`);
    console.log('');
  });
}

main().catch(console.error);
