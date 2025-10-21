"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface TweetData {
  id: string;
  tweet_id: string;
  username: string;
  tweet_text: string;
  token_address: string;
  tweet_url: string | null;
  submitted_at: string;
  created_at: string;
}

interface LiveTweetsProps {
  initialTweets: TweetData[];
}

function formatRelativeTime(timestamp: string) {
  const now = new Date();
  const tweetTime = new Date(timestamp);
  const diffMs = now.getTime() - tweetTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function LiveTweets({ initialTweets }: LiveTweetsProps) {
  const [tweets, setTweets] = useState<TweetData[]>(initialTweets);

  // Subscribe to real-time tweet inserts
  useEffect(() => {
    const channel = supabase
      .channel('live-tweets')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tweets'
        },
        (payload) => {
          console.log('New tweet received:', payload);
          const newTweet = payload.new as TweetData;

          // Add new tweet to the top of the list
          setTweets((prev) => [newTweet, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-full bg-background overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b-2 border-border px-4 py-3 z-10">
        <h2 className="text-sm font-bold text-foreground">LIVE CONTRACT FEED</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Token recommendations from Airtable
        </p>
      </div>

      {/* Tweets List */}
      <div className="p-4 space-y-3">
        {tweets.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No tweets yet. Waiting for contract recommendations from Airtable...
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Showing {tweets.length} contract signal{tweets.length !== 1 ? 's' : ''}
            </p>
            {tweets.map((tweet) => (
              <div
                key={tweet.id}
                className="border-2 border-border bg-card p-3 space-y-2 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Tweet Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Username */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-primary truncate">
                        @{tweet.username}
                      </span>
                      {tweet.tweet_url && (
                        <a
                          href={tweet.tweet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline whitespace-nowrap flex-shrink-0"
                        >
                          View Tweet →
                        </a>
                      )}
                    </div>

                    {/* Tweet Text */}
                    {tweet.tweet_text && (
                      <p className="text-xs text-foreground line-clamp-3">
                        {tweet.tweet_text}
                      </p>
                    )}

                    {/* Token Address */}
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Contract:</div>
                      <a
                        href={`https://solscan.io/token/${tweet.token_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-primary hover:underline break-all block"
                      >
                        {tweet.token_address}
                      </a>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {formatRelativeTime(tweet.submitted_at)}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
