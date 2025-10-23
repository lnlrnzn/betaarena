import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ====================
// CONFIGURATION
// ====================

const TWITTER_API_URL = 'https://api.twitterapi.io/twitter/tweet/advanced_search';
const TWITTER_API_KEY = 'new1_34739c8d88174804bce2824979f4e716';
const SEARCH_QUERY = 'I declare that I will join @TrenchMarking';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Team name variations mapped to agent UUIDs
const TEAM_MAPPING: Record<string, string> = {
  'claude': 'd8d17db6-eab8-4400-8632-1a549b3cb290',
  'claude sonnet': 'd8d17db6-eab8-4400-8632-1a549b3cb290',
  'claude sonnet 4.5': 'd8d17db6-eab8-4400-8632-1a549b3cb290',
  'gpt-5': '0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc',
  'gpt5': '0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc',
  'gemini': 'a73916de-5fa8-4085-906a-e3f7358d0e9e',
  'gemini 2.5': 'a73916de-5fa8-4085-906a-e3f7358d0e9e',
  'gemini 2.5 pro': 'a73916de-5fa8-4085-906a-e3f7358d0e9e',
  'grok': 'd8ed8ce7-ea5b-48dd-a4ab-22488da3f2ce',
  'grok 4': 'd8ed8ce7-ea5b-48dd-a4ab-22488da3f2ce',
  'qwen': 'bd389a97-ed1b-47b3-be23-17063c662327',
  'qwen 3': 'bd389a97-ed1b-47b3-be23-17063c662327',
  'qwen 3 max': 'bd389a97-ed1b-47b3-be23-17063c662327',
  'glm': '272ec813-4b15-4556-a8f9-33e5bee817f0',
  'glm 4.6': '272ec813-4b15-4556-a8f9-33e5bee817f0',
  'deepseek': '32c614c8-c36b-49a6-abd1-a36620dfd359',
  'deepseek v3': '32c614c8-c36b-49a6-abd1-a36620dfd359',
};

interface TwitterMention {
  id: string;
  text: string;
  createdAt: string;
  url?: string;
  author: {
    id: string;
    userName: string;
    name?: string;
    profilePicture?: string;
    followers?: number;
    following?: number;
  };
  entities?: {
    user_mentions?: Array<{ screen_name: string }>;
  };
}

interface TwitterAPIResponse {
  tweets: TwitterMention[];
  next_cursor?: string;
  has_next_page?: boolean;
}

interface TeamDeclaration {
  cycle_id: string;
  agent_id: string;
  tweet_id: string;
  twitter_username: string;
  twitter_user_id: string;
  twitter_name: string;
  profile_picture: string | null;
  followers_count: number;
  following_count: number;
  tweet_text: string;
  tweet_url: string;
  declared_at: string;
  tweet_data: any;
}

// ====================
// API FUNCTIONS
// ====================

async function searchDeclarations(cursor?: string): Promise<TwitterAPIResponse> {
  const url = new URL(TWITTER_API_URL);
  url.searchParams.append('query', SEARCH_QUERY);
  url.searchParams.append('queryType', 'Latest');
  if (cursor) {
    url.searchParams.append('cursor', cursor);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'X-API-Key': TWITTER_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchAllDeclarationsFromSearch(): Promise<TwitterMention[]> {
  const allTweets: TwitterMention[] = [];
  let cursor: string | undefined;
  let pageCount = 0;
  const MAX_PAGES = 1000;

  console.log('Phase 1: Searching via Advanced Search API...');
  console.log(`Query: "${SEARCH_QUERY}"\n`);

  while (pageCount < MAX_PAGES) {
    const response = await searchDeclarations(cursor);

    if (response.tweets && response.tweets.length > 0) {
      allTweets.push(...response.tweets);
      pageCount++;
      console.log(`  Page ${pageCount}: +${response.tweets.length} tweets (Total: ${allTweets.length})`);
    } else {
      console.log('  No more tweets found.');
      break;
    }

    cursor = response.next_cursor;
    if (!cursor) {
      console.log('  Reached end (no next_cursor).');
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✓ Found ${allTweets.length} tweets via search\n`);
  return allTweets;
}

// ====================
// VALIDATION
// ====================

function validateAndParseTweet(tweet: TwitterMention, cycleId: string): TeamDeclaration | null {
  try {
    const author = tweet.author;

    // Check for declaration template
    const templateRegex = /I declare that I will join (.+?)'s team in @TrenchMarking/i;
    const match = tweet.text.match(templateRegex);

    if (!match) {
      return null;
    }

    const teamNameRaw = match[1].trim();
    const teamNameLower = teamNameRaw.toLowerCase();

    // Map team name to agent_id
    const agentId = TEAM_MAPPING[teamNameLower];

    if (!agentId) {
      console.log(`  ⚠️  Unknown team: "${teamNameRaw}" (@${author.userName})`);
      return null;
    }

    const tweetDate = new Date(tweet.createdAt);
    const declaredAt = tweetDate.toISOString();

    return {
      cycle_id: cycleId,
      agent_id: agentId,
      tweet_id: tweet.id,
      twitter_username: author.userName,
      twitter_user_id: author.id,
      twitter_name: author.name || author.userName,
      profile_picture: author.profilePicture || null,
      followers_count: author.followers || 0,
      following_count: author.following || 0,
      tweet_text: tweet.text,
      tweet_url: tweet.url || `https://x.com/${author.userName}/status/${tweet.id}`,
      declared_at: declaredAt,
      tweet_data: tweet,
    };
  } catch (error: any) {
    console.log(`  ❌ Parse error for tweet ${tweet.id}: ${error.message}`);
    return null;
  }
}

// ====================
// DATABASE
// ====================

async function getCurrentCycleId(): Promise<string> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('cycles')
    .select('id')
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error(`Failed to fetch current cycle: ${error?.message || 'No active cycle'}`);
  }

  return data.id;
}

async function getExistingDeclarations(): Promise<Set<string>> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('team_declarations')
    .select('tweet_id');

  if (error) {
    throw new Error(`Failed to fetch existing declarations: ${error.message}`);
  }

  return new Set(data?.map(d => d.tweet_id) || []);
}

async function insertDeclarations(declarations: TeamDeclaration[]): Promise<number> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data, error } = await supabase
    .from('team_declarations')
    .upsert(declarations, {
      onConflict: 'cycle_id,twitter_username',
      ignoreDuplicates: true,
    })
    .select();

  if (error) {
    throw new Error(`Failed to insert declarations: ${error.message}`);
  }

  return data?.length || 0;
}

// ====================
// MAIN
// ====================

async function main() {
  console.log('='.repeat(70));
  console.log('COMPLETE TEAM DECLARATIONS COLLECTOR');
  console.log('='.repeat(70));
  console.log('');

  try {
    // Get cycle ID
    const cycleId = await getCurrentCycleId();
    console.log(`Current cycle ID: ${cycleId}\n`);

    // Source 1: Advanced Search
    const searchTweets = await fetchAllDeclarationsFromSearch();

    // Source 2: Already fetched mentions
    console.log('Phase 2: Loading previously fetched mentions...');
    const mentionsPath = path.join(__dirname, 'all-tweets-raw.json');
    let mentionTweets: TwitterMention[] = [];

    if (fs.existsSync(mentionsPath)) {
      mentionTweets = JSON.parse(fs.readFileSync(mentionsPath, 'utf-8'));
      console.log(`✓ Loaded ${mentionTweets.length} mentions from file\n`);
    } else {
      console.log('⚠️  No mentions file found, skipping\n');
    }

    // Combine and deduplicate
    console.log('Phase 3: Combining and deduplicating...');
    const tweetMap = new Map<string, TwitterMention>();

    searchTweets.forEach(t => tweetMap.set(t.id, t));
    mentionTweets.forEach(t => tweetMap.set(t.id, t));

    const allUniqueTweets = Array.from(tweetMap.values());
    console.log(`✓ Total unique tweets: ${allUniqueTweets.length}\n`);

    // Validate and parse
    console.log('Phase 4: Validating and parsing declarations...');
    const validDeclarations: TeamDeclaration[] = [];

    for (const tweet of allUniqueTweets) {
      const declaration = validateAndParseTweet(tweet, cycleId);
      if (declaration) {
        validDeclarations.push(declaration);
        console.log(`  ✓ @${tweet.author.userName} → ${declaration.agent_id.substring(0, 8)}...`);
      }
    }

    console.log(`\n✓ Valid declarations: ${validDeclarations.length}\n`);

    // Save results
    const outputPath = path.join(__dirname, 'all-declarations-found.json');
    fs.writeFileSync(outputPath, JSON.stringify(validDeclarations, null, 2));
    console.log(`✓ Saved to: ${outputPath}\n`);

    // Compare with DB
    console.log('Phase 5: Comparing with database...');
    const existingTweetIds = await getExistingDeclarations();

    const newDeclarations = validDeclarations.filter(d => !existingTweetIds.has(d.tweet_id));
    const alreadyInDb = validDeclarations.filter(d => existingTweetIds.has(d.tweet_id));

    console.log(`  Already in DB: ${alreadyInDb.length}`);
    console.log(`  Missing (new): ${newDeclarations.length}\n`);

    if (newDeclarations.length > 0) {
      console.log('Missing declarations:');
      newDeclarations.forEach((d, i) => {
        console.log(`  ${i+1}. @${d.twitter_username} - ${d.tweet_id}`);
      });
      console.log('');
    }

    // Insert new declarations
    if (newDeclarations.length > 0) {
      console.log('Phase 6: Inserting new declarations...');
      const insertedCount = await insertDeclarations(newDeclarations);
      console.log(`✓ Inserted ${insertedCount} new declarations\n`);
    } else {
      console.log('Phase 6: No new declarations to insert\n');
    }

    // Final summary
    console.log('='.repeat(70));
    console.log('FINAL SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total tweets searched:        ${allUniqueTweets.length}`);
    console.log(`Valid declarations found:     ${validDeclarations.length}`);
    console.log(`Already in database:          ${alreadyInDb.length}`);
    console.log(`Newly inserted:               ${newDeclarations.length}`);
    console.log('='.repeat(70));

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
