import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ====================
// CONFIGURATION
// ====================

const TWITTER_API_URL = 'https://api.twitterapi.io/twitter/tweet/advanced_search';
const TWITTER_API_KEY = 'new1_34739c8d88174804bce2824979f4e716';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Search queries
const SEARCH_QUERIES = [
  '"Claude\'s team" @TrenchMarking since:2025-10-22',
  '"GPT-5\'s team" @TrenchMarking since:2025-10-22',
  '"Gemini\'s team" @TrenchMarking since:2025-10-22',
  '"Grok\'s team" @TrenchMarking since:2025-10-22',
  '"Qwen\'s team" @TrenchMarking since:2025-10-22',
  '"DeepSeek\'s team" @TrenchMarking since:2025-10-22',
  '"GLM\'s team" @TrenchMarking since:2025-10-22',
  '"Solana Trenching Benchmark" @TrenchMarking since:2025-10-22',
  '"I declare" @TrenchMarking since:2025-10-22',
];

// Team mapping
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

async function searchTweets(query: string, cursor?: string): Promise<TwitterAPIResponse> {
  const url = new URL(TWITTER_API_URL);
  url.searchParams.append('query', query);
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

async function fetchAllForQuery(query: string): Promise<TwitterMention[]> {
  const allTweets: TwitterMention[] = [];
  let cursor: string | undefined;
  let pageCount = 0;
  const MAX_PAGES = 100;

  while (pageCount < MAX_PAGES) {
    try {
      const response = await searchTweets(query, cursor);

      if (response.tweets && response.tweets.length > 0) {
        allTweets.push(...response.tweets);
        pageCount++;
      } else {
        break;
      }

      cursor = response.next_cursor;
      if (!cursor) break;

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.log(`    ⚠️  Error: ${error.message}`);
      break;
    }
  }

  return allTweets;
}

// ====================
// VALIDATION
// ====================

function validateAndParseTweet(tweet: TwitterMention, cycleId: string): TeamDeclaration | null {
  try {
    const author = tweet.author;

    const templateRegex = /I declare that I will join (.+?)'s team in @TrenchMarking/i;
    const match = tweet.text.match(templateRegex);

    if (!match) return null;

    const teamNameRaw = match[1].trim();
    const teamNameLower = teamNameRaw.toLowerCase();

    const agentId = TEAM_MAPPING[teamNameLower];
    if (!agentId) {
      console.log(`      ⚠️  Unknown team: "${teamNameRaw}" (@${author.userName})`);
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
  console.log('COMPREHENSIVE TEAM DECLARATIONS SEARCH');
  console.log('='.repeat(70));
  console.log('');

  try {
    const cycleId = await getCurrentCycleId();
    console.log(`Current cycle ID: ${cycleId}\n`);

    // Phase 1: Run all searches
    console.log('Phase 1: Running multiple searches...\n');
    const allTweetsMap = new Map<string, TwitterMention>();

    for (let i = 0; i < SEARCH_QUERIES.length; i++) {
      const query = SEARCH_QUERIES[i];
      console.log(`  [${i+1}/${SEARCH_QUERIES.length}] Searching: ${query}`);

      const tweets = await fetchAllForQuery(query);
      console.log(`    → Found ${tweets.length} tweets`);

      tweets.forEach(t => allTweetsMap.set(t.id, t));

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✓ Total unique tweets from all searches: ${allTweetsMap.size}\n`);

    // Phase 2: Validate
    console.log('Phase 2: Validating declarations...\n');
    const validDeclarations: TeamDeclaration[] = [];

    for (const tweet of allTweetsMap.values()) {
      const declaration = validateAndParseTweet(tweet, cycleId);
      if (declaration) {
        validDeclarations.push(declaration);
        console.log(`  ✓ @${tweet.author.userName} → ${declaration.agent_id.substring(0, 8)}...`);
      }
    }

    console.log(`\n✓ Valid declarations: ${validDeclarations.length}\n`);

    // Save results
    const outputPath = path.join(__dirname, 'comprehensive-search-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(validDeclarations, null, 2));
    console.log(`✓ Saved to: ${outputPath}\n`);

    // Phase 3: Compare with DB
    console.log('Phase 3: Comparing with database...\n');
    const existingTweetIds = await getExistingDeclarations();

    const newDeclarations = validDeclarations.filter(d => !existingTweetIds.has(d.tweet_id));
    const alreadyInDb = validDeclarations.filter(d => existingTweetIds.has(d.tweet_id));

    console.log(`  Already in DB: ${alreadyInDb.length}`);
    console.log(`  Missing (new): ${newDeclarations.length}\n`);

    if (newDeclarations.length > 0) {
      console.log('Missing declarations:');
      newDeclarations.forEach((d, i) => {
        console.log(`  ${i+1}. @${d.twitter_username} - Team ${d.agent_id.substring(0, 8)}... - ${d.tweet_id}`);
      });
      console.log('');
    }

    // Phase 4: Insert
    if (newDeclarations.length > 0) {
      console.log('Phase 4: Inserting new declarations...\n');
      const insertedCount = await insertDeclarations(newDeclarations);
      console.log(`✓ Inserted ${insertedCount} new declarations\n`);
    } else {
      console.log('Phase 4: No new declarations to insert\n');
    }

    // Summary
    console.log('='.repeat(70));
    console.log('FINAL SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total tweets found:           ${allTweetsMap.size}`);
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
