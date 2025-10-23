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

// EXHAUSTIVE search queries - covering ALL possible angles
const SEARCH_QUERIES = [
  // Extended time ranges
  '"I declare" @TrenchMarking since:2025-10-20',
  '"I declare" @TrenchMarking since:2025-10-15',
  '"I declare" @TrenchMarking',

  // Alternative writings
  '"I declare I will join" @TrenchMarking since:2025-10-20',
  '"will join" @TrenchMarking since:2025-10-20',
  '"Trenching Benchmark" @TrenchMarking since:2025-10-20',
  '@TrenchMarking challenge since:2025-10-20',

  // Team-specific with time
  'Claude team @TrenchMarking since:2025-10-20',
  'GPT-5 team @TrenchMarking since:2025-10-20',
  'GPT team @TrenchMarking since:2025-10-20',
  'Gemini team @TrenchMarking since:2025-10-20',
  'Grok team @TrenchMarking since:2025-10-20',
  'Qwen team @TrenchMarking since:2025-10-20',
  'DeepSeek team @TrenchMarking since:2025-10-20',
  'GLM team @TrenchMarking since:2025-10-20',

  // Team variations
  '"Claude Sonnet" @TrenchMarking since:2025-10-20',
  '"Gemini 2.5" @TrenchMarking since:2025-10-20',
  '"Qwen 3" @TrenchMarking since:2025-10-20',

  // Broader searches
  'Solana Trenching @TrenchMarking since:2025-10-20',
  'SOL rewards @TrenchMarking since:2025-10-20',
  'creator fees @TrenchMarking since:2025-10-20',
];

const TEAM_MAPPING: Record<string, string> = {
  'claude': 'd8d17db6-eab8-4400-8632-1a549b3cb290',
  'claude sonnet': 'd8d17db6-eab8-4400-8632-1a549b3cb290',
  'claude sonnet 4.5': 'd8d17db6-eab8-4400-8632-1a549b3cb290',
  'gpt-5': '0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc',
  'gpt5': '0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc',
  'gpt': '0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc',
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

      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      console.log(`      ⚠️  Error: ${error.message}`);
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

    // More flexible regex - allow variations
    const patterns = [
      /I declare (?:that )?I will join (.+?)'s team in @TrenchMarking/i,
      /I declare (?:that )?I will join (.+?) team in @TrenchMarking/i,
    ];

    let match = null;
    let teamNameRaw = '';

    for (const pattern of patterns) {
      match = tweet.text.match(pattern);
      if (match) {
        teamNameRaw = match[1].trim();
        break;
      }
    }

    if (!match || !teamNameRaw) return null;

    const teamNameLower = teamNameRaw.toLowerCase();

    const agentId = TEAM_MAPPING[teamNameLower];
    if (!agentId) {
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

async function getExistingDeclarations(): Promise<{ tweetIds: Set<string>, validUsers: string[] }> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Get all declarations
  const { data: allData } = await supabase
    .from('team_declarations')
    .select('tweet_id, twitter_username, tweet_text');

  const tweetIds = new Set(allData?.map(d => d.tweet_id) || []);

  // Get only valid declarations (with proper template)
  const validUsers = allData
    ?.filter(d => /I declare (?:that )?I will join .+?'s team in @TrenchMarking/i.test(d.tweet_text))
    .map(d => d.twitter_username) || [];

  return { tweetIds, validUsers };
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
  console.log('EXHAUSTIVE TEAM DECLARATIONS SEARCH - ALL ANGLES');
  console.log('='.repeat(70));
  console.log('');

  try {
    const cycleId = await getCurrentCycleId();
    console.log(`Current cycle ID: ${cycleId}\n`);

    // Phase 1: Run all searches
    console.log(`Phase 1: Running ${SEARCH_QUERIES.length} different searches...\n`);
    const allTweetsMap = new Map<string, TwitterMention>();
    let queryNum = 0;

    for (const query of SEARCH_QUERIES) {
      queryNum++;
      console.log(`  [${queryNum}/${SEARCH_QUERIES.length}] ${query}`);

      const tweets = await fetchAllForQuery(query);
      console.log(`      → ${tweets.length} tweets`);

      tweets.forEach(t => allTweetsMap.set(t.id, t));

      await new Promise(resolve => setTimeout(resolve, 800));
    }

    console.log(`\n✓ Total unique tweets: ${allTweetsMap.size}\n`);

    // Phase 2: Validate
    console.log('Phase 2: Validating declarations...\n');
    const validDeclarations: TeamDeclaration[] = [];

    for (const tweet of allTweetsMap.values()) {
      const declaration = validateAndParseTweet(tweet, cycleId);
      if (declaration) {
        validDeclarations.push(declaration);
        const teamName = Object.entries(TEAM_MAPPING).find(([k,v]) => v === declaration.agent_id)?.[0] || 'unknown';
        console.log(`  ✓ @${tweet.author.userName} → ${teamName}`);
      }
    }

    console.log(`\n✓ Valid declarations: ${validDeclarations.length}\n`);

    // Save all results
    const outputPath = path.join(__dirname, 'exhaustive-search-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(validDeclarations, null, 2));
    console.log(`✓ Saved to: ${outputPath}\n`);

    // Phase 3: Compare with DB
    console.log('Phase 3: Comparing with database...\n');
    const { tweetIds: existingTweetIds } = await getExistingDeclarations();

    const newDeclarations = validDeclarations.filter(d => !existingTweetIds.has(d.tweet_id));
    const alreadyInDb = validDeclarations.filter(d => existingTweetIds.has(d.tweet_id));

    console.log(`  Already in DB: ${alreadyInDb.length}`);
    console.log(`  Missing (new): ${newDeclarations.length}\n`);

    if (newDeclarations.length > 0) {
      console.log('NEW declarations found:');
      newDeclarations.forEach((d, i) => {
        const teamName = Object.entries(TEAM_MAPPING).find(([k,v]) => v === d.agent_id)?.[0] || 'unknown';
        const date = new Date(d.declared_at).toLocaleString('de-DE');
        console.log(`  ${i+1}. @${d.twitter_username} → ${teamName} (${date})`);
        console.log(`     ${d.tweet_id}`);
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
    console.log(`Queries executed:             ${SEARCH_QUERIES.length}`);
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
