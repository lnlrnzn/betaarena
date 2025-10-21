-- Migration: Cleanup tweets table - Add tweet_url, remove unused fields
-- Purpose: Align tweets table with actual Airtable Feed data

-- Add tweet_url field for TweetURL from Airtable
ALTER TABLE tweets
ADD COLUMN tweet_url TEXT;

-- Remove unused fields that don't come from Airtable
ALTER TABLE tweets
DROP COLUMN IF EXISTS token_name,
DROP COLUMN IF EXISTS token_symbol,
DROP COLUMN IF EXISTS token_image_url,
DROP COLUMN IF EXISTS verified_at,
DROP COLUMN IF EXISTS is_legit;

-- Add comment to document the table structure
COMMENT ON TABLE tweets IS 'Contract/token recommendation tweets from Airtable Feed table';
COMMENT ON COLUMN tweets.tweet_id IS 'Twitter tweet ID from Airtable TweetID field';
COMMENT ON COLUMN tweets.username IS 'Twitter username from Airtable Username field';
COMMENT ON COLUMN tweets.tweet_text IS 'Tweet content from Airtable TweetContent field';
COMMENT ON COLUMN tweets.token_address IS 'Solana contract address from Airtable Contract field';
COMMENT ON COLUMN tweets.tweet_url IS 'Twitter URL from Airtable TweetURL field';
COMMENT ON COLUMN tweets.submitted_at IS 'Tweet timestamp from Airtable TweetTime field';
COMMENT ON COLUMN tweets.airtable_record_id IS 'Airtable record ID for debugging';
