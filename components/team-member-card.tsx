import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface TeamMember {
  id: string;
  twitter_username: string;
  twitter_name: string | null;
  profile_picture: string | null;
  followers_count: number;
  following_count: number;
  declared_at: string;
  tweet_url: string | null;
}

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const timeAgo = formatDistanceToNow(new Date(member.declared_at), {
    addSuffix: true,
  });

  return (
    <div className="border-2 border-border bg-card p-4 hover:bg-muted transition-colors">
      <div className="flex items-start gap-3">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {member.profile_picture ? (
            <Image
              src={member.profile_picture}
              alt={member.twitter_username}
              width={48}
              height={48}
              className="rounded-full border-2 border-border"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border-2 border-border bg-muted flex items-center justify-center text-foreground font-bold">
              {member.twitter_username[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-bold text-sm text-foreground truncate">
              {member.twitter_name || member.twitter_username}
            </div>
            <a
              href={`https://twitter.com/${member.twitter_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              @{member.twitter_username}
            </a>
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="font-bold text-foreground">
                {member.followers_count.toLocaleString()}
              </span>
              <span>followers</span>
            </div>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>

          {member.tweet_url && (
            <a
              href={member.tweet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-primary hover:underline"
            >
              View declaration →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
