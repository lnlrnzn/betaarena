import Image from "next/image";
import { formatStake } from "@/lib/utils/betting";

interface HighRoller {
  id: string;
  twitter_username: string;
  twitter_name: string | null;
  profile_picture: string | null;
  followers_count: number;
}

interface HighRollersSectionProps {
  highRollers: HighRoller[];
  agentColor: string;
}

export function HighRollersSection({ highRollers, agentColor }: HighRollersSectionProps) {
  if (!highRollers || highRollers.length === 0) {
    return null;
  }

  return (
    <div className="border-2 border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🐋</span>
        <h3 className="text-sm font-bold text-foreground">HIGH ROLLERS</h3>
      </div>

      <div className="space-y-2">
        {highRollers.map((roller, index) => (
          <div
            key={roller.id}
            className="flex items-center gap-3 p-2 bg-background border-l-4"
            style={{ borderLeftColor: agentColor }}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-6 text-center font-bold text-xs text-muted-foreground">
              #{index + 1}
            </div>

            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {roller.profile_picture ? (
                <Image
                  src={roller.profile_picture}
                  alt={roller.twitter_username}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-border bg-muted flex items-center justify-center text-xs font-bold">
                  {roller.twitter_username[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <a
                href={`https://twitter.com/${roller.twitter_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-foreground hover:text-primary transition-colors truncate block"
              >
                @{roller.twitter_username}
              </a>
            </div>

            {/* Stake */}
            <div className="flex-shrink-0 text-xs font-bold" style={{ color: agentColor }}>
              {formatStake(roller.followers_count)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
