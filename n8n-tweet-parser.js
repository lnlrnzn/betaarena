// N8N Code Node: Team Declaration Parser
// Parses tweets to detect valid team declarations for TrenchMark challenge

// ====================
// CONFIGURATION
// ====================

// Cycle 1 ID - November 1-8, 2025
const ACTIVE_CYCLE_ID = "2d7a0eb2-63dc-48fe-8f53-48831c9374a1";

// Optional: Fetch active cycle dynamically from Supabase
// If you want to fetch the active cycle instead of hardcoding:
// 1. Add a Supabase node before this one
// 2. Query: SELECT id FROM cycles WHERE is_active = true LIMIT 1
// 3. Then use: const ACTIVE_CYCLE_ID = $input.first().json.id;

// Team name variations mapped to agent UUIDs
const TEAM_MAPPING = {
  // Claude variations
  'claude': 'd8d17db6-eab8-4400-8632-1a549b3cb290',
  'claude sonnet': 'd8d17db6-eab8-4400-8632-1a549b3cb290',
  'claude sonnet 4.5': 'd8d17db6-eab8-4400-8632-1a549b3cb290',

  // GPT-5 variations
  'gpt-5': '0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc',
  'gpt5': '0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc',

  // Gemini variations
  'gemini': 'a73916de-5fa8-4085-906a-e3f7358d0e9e',
  'gemini 2.5': 'a73916de-5fa8-4085-906a-e3f7358d0e9e',
  'gemini 2.5 pro': 'a73916de-5fa8-4085-906a-e3f7358d0e9e',

  // Grok variations
  'grok': 'd8ed8ce7-ea5b-48dd-a4ab-22488da3f2ce',
  'grok 4': 'd8ed8ce7-ea5b-48dd-a4ab-22488da3f2ce',

  // Qwen variations
  'qwen': 'bd389a97-ed1b-47b3-be23-17063c662327',
  'qwen 3': 'bd389a97-ed1b-47b3-be23-17063c662327',
  'qwen 3 max': 'bd389a97-ed1b-47b3-be23-17063c662327',

  // GLM variations
  'glm': '272ec813-4b15-4556-a8f9-33e5bee817f0',
  'glm 4.6': '272ec813-4b15-4556-a8f9-33e5bee817f0',

  // Mistral variations
  'mistral': '32c614c8-c36b-49a6-abd1-a36620dfd359',
  'mistral large': '32c614c8-c36b-49a6-abd1-a36620dfd359',
};

// ====================
// MAIN PARSER LOGIC
// ====================

function parseDeclaration(inputData) {
  try {
    // Handle different input structures
    // Input can be: [{ tweets: [...] }] or { tweets: [...] }
    let tweetsArray;

    if (Array.isArray(inputData)) {
      // If inputData is an array, get the first element
      tweetsArray = inputData[0]?.tweets;
    } else if (inputData?.tweets) {
      // If inputData is already the object with tweets
      tweetsArray = inputData.tweets;
    } else {
      return {
        valid: false,
        reason: 'Invalid input structure',
        declaration: null
      };
    }

    if (!tweetsArray || tweetsArray.length === 0) {
      return {
        valid: false,
        reason: 'No tweets found in input data',
        declaration: null
      };
    }

    const tweet = tweetsArray[0];
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
        declaration: null
      };
    }

    // VALIDATION 2: Check for $TLM or $TRENCHMARK token
    const hasTlmToken = tweet.text.includes('$TLM');
    const hasTrenchmarkToken = tweet.text.includes('$TRENCHMARK');

    if (!hasTlmToken && !hasTrenchmarkToken) {
      return {
        valid: false,
        reason: 'Tweet must contain $TLM or $TRENCHMARK token',
        declaration: null
      };
    }

    // VALIDATION 3: Extract team name from exact template
    // Template: "I declare that I will join {TEAM}'s team in @TrenchMarking"
    const templateRegex = /I declare that I will join (.+?)'s team in @TrenchMarking/i;
    const match = tweet.text.match(templateRegex);

    if (!match) {
      return {
        valid: false,
        reason: 'Tweet does not match the required template format',
        declaration: null
      };
    }

    const teamNameRaw = match[1].trim();
    const teamNameLower = teamNameRaw.toLowerCase();

    // VALIDATION 4: Map team name to agent_id
    const agentId = TEAM_MAPPING[teamNameLower];

    if (!agentId) {
      return {
        valid: false,
        reason: `Unknown team name: "${teamNameRaw}". Valid teams: Claude, GPT-5, Gemini, Grok, Qwen, GLM, Mistral`,
        declaration: null
      };
    }

    // VALIDATION 5: Check template completeness (must mention "Solana Trenching Benchmark")
    if (!tweet.text.includes('Solana Trenching Benchmark')) {
      return {
        valid: false,
        reason: 'Tweet must mention "Solana Trenching Benchmark"',
        declaration: null
      };
    }

    // Parse tweet timestamp to ISO format
    const tweetDate = new Date(tweet.createdAt);
    const declaredAt = tweetDate.toISOString();

    // Build database-ready declaration object
    const declaration = {
      cycle_id: ACTIVE_CYCLE_ID,
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
      tweet_data: tweet // Store full tweet JSON
    };

    return {
      valid: true,
      reason: `Valid declaration for team: ${teamNameRaw}`,
      team_name: teamNameRaw,
      declaration: declaration
    };

  } catch (error) {
    return {
      valid: false,
      reason: `Parser error: ${error.message}`,
      declaration: null
    };
  }
}

// ====================
// N8N EXECUTION
// ====================

const inputData = $input.all()[0].json;
const result = parseDeclaration(inputData);

return result;
