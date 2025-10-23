import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ====================
// CONFIGURATION
// ====================

const TWITTER_API_URL = 'https://api.twitterapi.io/twitter/user/mentions';
const TWITTER_API_KEY = 'new1_34739c8d88174804bce2824979f4e716';
const TWITTER_USERNAME = 'TrenchMarking';

// Supabase configuration (from environment)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

// ====================
// INTERFACES
// ====================

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
    user_mentions?: Array<{
      screen_name: string;
    }>;
  };
}

interface TwitterAPIResponse {
  tweets: TwitterMention[];
  next_cursor?: string;
  has_next_page?: boolean;
}

interface ValidationResult {
  valid: boolean;
  reason: string;
  team_name?: string;
  declaration?: TeamDeclaration;
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
// TWITTER API FUNCTIONS
// ====================

async function fetchTwitterMentions(cursor?: string): Promise<TwitterAPIResponse> {
  const url = new URL(TWITTER_API_URL);
  url.searchParams.append('userName', TWITTER_USERNAME);
  if (cursor) {
    url.searchParams.append('cursor', cursor);
  }

  console.log(`Fetching mentions... ${cursor ? `(cursor: ${cursor})` : '(first page)'}`);

  const response = await fetch(url.toString(), {
    headers: {
      'X-API-Key': TWITTER_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchAllMentions(): Promise<TwitterMention[]> {
  const allMentions: TwitterMention[] = [];
  let cursor: string | undefined;
  let pageCount = 0;
  let hasNextPage = true;
  const MAX_PAGES = 1000; // Safety limit

  while (hasNextPage && pageCount < MAX_PAGES) {
    const response = await fetchTwitterMentions(cursor);

    if (response.tweets && response.tweets.length > 0) {
      allMentions.push(...response.tweets);
      pageCount++;
      console.log(`  Page ${pageCount}: Found ${response.tweets.length} mentions (Total: ${allMentions.length})`);
    } else {
      // No tweets in response, stop
      console.log('  No more tweets found.');
      break;
    }

    // Check if there's a next page
    cursor = response.next_cursor;
    hasNextPage = !!response.next_cursor;

    if (!hasNextPage) {
      console.log('  Reached end of available data (no next_cursor).');
    }

    // Small delay to avoid rate limiting
    if (hasNextPage) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  if (pageCount >= MAX_PAGES) {
    console.log(`\n⚠️  Reached maximum page limit (${MAX_PAGES} pages)`);
  }

  console.log(`\n✓ Fetched ${allMentions.length} total mentions across ${pageCount} pages\n`);

  return allMentions;
}

// ====================
// VALIDATION FUNCTIONS
// ====================

function validateTweet(tweet: TwitterMention, cycleId: string): ValidationResult {
  try {
    const author = tweet.author;

    // VALIDATION 1: Check @TrenchMarking mention
    const mentions = tweet.entities?.user_mentions || [];
    const hasTrenchMarkMention = mentions.some(
      mention => mention.screen_name === 'TrenchMarking'
    );

    if (!hasTrenchMarkMention) {
      return {
        valid: false,
        reason: 'Tweet does not mention @TrenchMarking',
      };
    }

    // VALIDATION 2: Extract team name from template
    // Template: "I declare that I will join {TEAM}'s team in @TrenchMarking"
    const templateRegex = /I declare that I will join (.+?)'s team in @TrenchMarking/i;
    const match = tweet.text.match(templateRegex);

    if (!match) {
      return {
        valid: false,
        reason: 'Tweet does not match the required template format',
      };
    }

    const teamNameRaw = match[1].trim();
    const teamNameLower = teamNameRaw.toLowerCase();

    // VALIDATION 3: Map team name to agent_id
    const agentId = TEAM_MAPPING[teamNameLower];

    if (!agentId) {
      return {
        valid: false,
        reason: `Unknown team name: "${teamNameRaw}"`,
      };
    }

    // Optional: Check that it mentions Solana (not required)
    const hasSolanaRef = tweet.text.toLowerCase().includes('solana');
    if (!hasSolanaRef) {
      console.log(`  ⚠️  Warning: Tweet by @${author.userName} doesn't mention Solana`);
    }

    // Parse tweet timestamp
    const tweetDate = new Date(tweet.createdAt);
    const declaredAt = tweetDate.toISOString();

    // Build database-ready declaration object
    const declaration: TeamDeclaration = {
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

    return {
      valid: true,
      reason: `Valid declaration for team: ${teamNameRaw}`,
      team_name: teamNameRaw,
      declaration,
    };
  } catch (error: any) {
    return {
      valid: false,
      reason: `Parser error: ${error.message}`,
    };
  }
}

// ====================
// DATABASE FUNCTIONS
// ====================

async function getCurrentCycleId(): Promise<string> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('cycles')
    .select('id')
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error(`Failed to fetch current cycle: ${error?.message || 'No active cycle found'}`);
  }

  return data.id;
}

async function insertDeclarations(declarations: TeamDeclaration[]): Promise<number> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Insert declarations with ON CONFLICT DO NOTHING
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
// MAIN EXECUTION
// ====================

async function main() {
  console.log('='.repeat(60));
  console.log('Twitter Mentions Fetcher & Team Declaration Importer');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Get current cycle ID
    console.log('Step 1: Fetching current cycle ID...');
    const cycleId = await getCurrentCycleId();
    console.log(`✓ Current cycle ID: ${cycleId}\n`);

    // Step 2: Fetch all Twitter mentions
    console.log('Step 2: Fetching all Twitter mentions...');
    const allMentions = await fetchAllMentions();

    // Save raw data as backup
    const backupPath = path.join(__dirname, 'twitter-mentions-backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(allMentions, null, 2));
    console.log(`✓ Saved raw mentions to: ${backupPath}\n`);

    // Step 3: Validate and parse declarations
    console.log('Step 3: Validating and parsing team declarations...');
    const validDeclarations: TeamDeclaration[] = [];
    const invalidTweets: Array<{ tweet_id: string; reason: string }> = [];

    for (const mention of allMentions) {
      const result = validateTweet(mention, cycleId);

      if (result.valid && result.declaration) {
        validDeclarations.push(result.declaration);
        console.log(`  ✓ Valid: @${mention.author.userName} → Team ${result.team_name}`);
      } else {
        invalidTweets.push({
          tweet_id: mention.id,
          reason: result.reason,
        });
      }
    }

    console.log(`\n✓ Found ${validDeclarations.length} valid declarations`);
    console.log(`✗ Skipped ${invalidTweets.length} invalid tweets\n`);

    // Save validation report
    const reportPath = path.join(__dirname, 'validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      total_mentions: allMentions.length,
      valid_declarations: validDeclarations.length,
      invalid_tweets: invalidTweets.length,
      valid_declarations_list: validDeclarations,
      invalid_tweets_list: invalidTweets,
    }, null, 2));
    console.log(`✓ Saved validation report to: ${reportPath}\n`);

    // Step 4: Insert into database
    if (validDeclarations.length > 0) {
      console.log('Step 4: Inserting declarations into database...');
      const insertedCount = await insertDeclarations(validDeclarations);
      console.log(`✓ Successfully inserted ${insertedCount} new declarations`);
      console.log(`  (${validDeclarations.length - insertedCount} were duplicates and skipped)\n`);
    } else {
      console.log('Step 4: No valid declarations to insert.\n');
    }

    // Summary
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total mentions fetched:       ${allMentions.length}`);
    console.log(`Valid declarations found:     ${validDeclarations.length}`);
    console.log(`Invalid tweets:               ${invalidTweets.length}`);
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
