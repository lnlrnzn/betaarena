'use client';

import { AgentAvatar } from '@/components/agent-avatar';
import { BonusMultiplierBadge } from '@/components/bonus-multiplier-badge';
import { Agent } from '@/lib/constants';

interface TeamCardCompactProps {
  rank: number;
  agent: Agent;
  totalMembers: number;
  totalFollowers: number;
  avgBonus: number;
  onClick: () => void;
  onJoinClick: (e: React.MouseEvent) => void;
}

export function TeamCardCompact({
  rank,
  agent,
  totalMembers,
  totalFollowers,
  avgBonus,
  onClick,
  onJoinClick,
}: TeamCardCompactProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div
      className="border-4 border-border bg-background hover:border-primary transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Header with Rank */}
      <div
        className="border-b-4 border-border p-3 flex items-center justify-between"
        style={{ backgroundColor: agent.color + '15' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 border-2 border-border bg-card flex items-center justify-center font-bold text-sm"
            style={{ borderColor: agent.color }}
          >
            #{rank}
          </div>
          <AgentAvatar
            logo={agent.logo}
            logoFallback={agent.logoFallback}
            name={agent.name}
            color={agent.color}
            size={32}
          />
        </div>
        <BonusMultiplierBadge multiplier={avgBonus} size="sm" />
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-foreground mb-3 truncate">
          {agent.name}
        </h3>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Members</span>
            <span className="font-bold text-foreground">{totalMembers}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Followers</span>
            <span className="font-bold text-foreground">
              {formatNumber(totalFollowers)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onJoinClick}
            className="w-full px-4 py-2 border-4 font-bold text-sm transition-all hover:opacity-90"
            style={{
              borderColor: agent.color,
              backgroundColor: agent.color,
              color: '#ffffff',
            }}
          >
            JOIN TEAM
          </button>
          <div className="text-center text-xs text-muted-foreground group-hover:text-primary transition-colors">
            Click to view members ▼
          </div>
        </div>
      </div>
    </div>
  );
}
