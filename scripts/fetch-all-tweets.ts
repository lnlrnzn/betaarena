import * as fs from 'fs';
import * as path from 'path';

// ====================
// CONFIGURATION
// ====================

const TWITTER_API_URL = 'https://api.twitterapi.io/twitter/user/mentions';
const TWITTER_API_KEY = 'new1_34739c8d88174804bce2824979f4e716';
const TWITTER_USERNAME = 'TrenchMarking';

interface TwitterMention {
  id: string;
  text: string;
  createdAt: string;
  url?: string;
  author: {
    id: string;
    userName: string;
    name?: string;
    followers?: number;
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

async function fetchTwitterMentions(cursor?: string): Promise<TwitterAPIResponse> {
  const url = new URL(TWITTER_API_URL);
  url.searchParams.append('userName', TWITTER_USERNAME);
  if (cursor) {
    url.searchParams.append('cursor', cursor);
  }

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

async function main() {
  console.log('='.repeat(70));
  console.log('FETCHING ALL TWITTER MENTIONS FOR @TrenchMarking');
  console.log('='.repeat(70));
  console.log('');

  const allMentions: TwitterMention[] = [];
  let cursor: string | undefined;
  let pageCount = 0;
  const MAX_PAGES = 1000;

  console.log('Fetching tweets...\n');

  while (pageCount < MAX_PAGES) {
    const response = await fetchTwitterMentions(cursor);

    if (response.tweets && response.tweets.length > 0) {
      allMentions.push(...response.tweets);
      pageCount++;
      console.log(`  Page ${pageCount}: +${response.tweets.length} tweets (Total: ${allMentions.length})`);
    } else {
      console.log('  No more tweets found.');
      break;
    }

    cursor = response.next_cursor;
    if (!cursor) {
      console.log('  Reached end (no next_cursor).');
      break;
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`TOTAL: ${allMentions.length} tweets fetched from ${pageCount} pages`);
  console.log('='.repeat(70));

  // Save raw data
  const backupPath = path.join(__dirname, 'all-tweets-raw.json');
  fs.writeFileSync(backupPath, JSON.stringify(allMentions, null, 2));
  console.log(`\n✓ Saved to: ${backupPath}`);

  // Create readable list
  console.log('\n' + '='.repeat(70));
  console.log('TWEET LIST (newest to oldest)');
  console.log('='.repeat(70));
  console.log('');

  const listLines: string[] = [];
  listLines.push('ALLE TWEETS VON @TrenchMarking MENTIONS');
  listLines.push('='.repeat(70));
  listLines.push('');
  listLines.push(`Total: ${allMentions.length} tweets\n`);

  allMentions.forEach((tweet, index) => {
    const date = new Date(tweet.createdAt).toLocaleString('de-DE');
    const text = tweet.text.length > 150 ? tweet.text.substring(0, 150) + '...' : tweet.text;

    listLines.push(`${index + 1}. [@${tweet.author.userName}] - ${date}`);
    listLines.push(`   Tweet ID: ${tweet.id}`);
    listLines.push(`   ${text.replace(/\n/g, ' ')}`);
    listLines.push('');

    // Also print to console (first 20)
    if (index < 20) {
      console.log(`${index + 1}. [@${tweet.author.userName}] - ${date}`);
      console.log(`   ${text.replace(/\n/g, ' ')}`);
      console.log('');
    }
  });

  if (allMentions.length > 20) {
    console.log(`... (showing first 20 of ${allMentions.length} tweets)`);
  }

  // Save readable list
  const listPath = path.join(__dirname, 'all-tweets-list.txt');
  fs.writeFileSync(listPath, listLines.join('\n'));
  console.log(`\n✓ Full list saved to: ${listPath}`);

  // Summary by date
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY BY DATE');
  console.log('='.repeat(70));

  const byDate: Record<string, number> = {};
  allMentions.forEach(tweet => {
    const date = new Date(tweet.createdAt).toISOString().split('T')[0];
    byDate[date] = (byDate[date] || 0) + 1;
  });

  Object.entries(byDate)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .forEach(([date, count]) => {
      console.log(`  ${date}: ${count} tweets`);
    });

  console.log('\n✓ Done!\n');
}

main().catch(console.error);
