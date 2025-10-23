const fetchedTweets = require('./twitter-mentions-backup.json');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: dbDeclarations, error } = await supabase
    .from('team_declarations')
    .select('tweet_id, twitter_username');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const fetchedTweetIds = new Set(fetchedTweets.map(t => t.id));
  const dbTweetIds = new Set(dbDeclarations.map(d => d.tweet_id));

  console.log(`Fetched tweets: ${fetchedTweets.length}`);
  console.log(`DB declarations: ${dbDeclarations.length}`);
  console.log('');

  // Check overlap
  const inBoth = dbDeclarations.filter(d => fetchedTweetIds.has(d.tweet_id));
  const inDBNotFetched = dbDeclarations.filter(d => !fetchedTweetIds.has(d.tweet_id));

  console.log(`Tweets in both: ${inBoth.length}`);
  if (inBoth.length > 0) {
    console.log('Examples:');
    inBoth.slice(0, 3).forEach(d => {
      console.log(`  - @${d.twitter_username} (${d.tweet_id})`);
    });
  }

  console.log('');
  console.log(`Declarations in DB but not in fetched tweets: ${inDBNotFetched.length}`);
  if (inDBNotFetched.length > 0) {
    console.log('(These are older tweets beyond the API limit)');
    console.log('Examples:');
    inDBNotFetched.slice(0, 5).forEach(d => {
      console.log(`  - @${d.twitter_username} (${d.tweet_id})`);
    });
  }
}

main().catch(console.error);
