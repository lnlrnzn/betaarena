import { formatDistanceToNow } from "date-fns";

interface RecentBacker {
  id: string;
  twitter_username: string;
  declared_at: string;
}

interface RecentBackersFeedProps {
  recentBackers: RecentBacker[];
  agentColor: string;
}

export function RecentBackersFeed({ recentBackers, agentColor }: RecentBackersFeedProps) {
  if (!recentBackers || recentBackers.length === 0) {
    return null;
  }

  return (
    <div className="border-2 border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔥</span>
        <h3 className="text-sm font-bold text-foreground">RECENT BACKERS</h3>
      </div>

      <div className="space-y-2">
        {recentBackers.map((backer) => {
          const timeAgo = formatDistanceToNow(new Date(backer.declared_at), {
            addSuffix: true,
            includeSeconds: true,
          });

          return (
            <div
              key={backer.id}
              className="flex items-center gap-2 p-2 bg-background border-l-4 text-xs"
              style={{ borderLeftColor: agentColor }}
            >
              <span className="text-muted-foreground">•</span>
              <a
                href={`https://twitter.com/${backer.twitter_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-foreground hover:text-primary transition-colors"
              >
                @{backer.twitter_username}
              </a>
              <span className="text-muted-foreground">backed</span>
              <span className="text-muted-foreground ml-auto">{timeAgo}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
