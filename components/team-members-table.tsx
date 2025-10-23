'use client';

import { useState } from 'react';
import { BonusMultiplierBadge } from './bonus-multiplier-badge';

export interface TeamMember {
  twitter_username: string;
  twitter_name: string;
  profile_picture: string | null;
  followers_count: number;
  declared_at: string;
  bonus_multiplier: number;
}

type SortBy = 'followers' | 'time' | 'bonus' | 'name';
type SortOrder = 'asc' | 'desc';

interface TeamMembersTableProps {
  members: TeamMember[];
  teamColor: string;
  isExpanded?: boolean;
}

export function TeamMembersTable({ members, teamColor, isExpanded = false }: TeamMembersTableProps) {
  const [sortBy, setSortBy] = useState<SortBy>('followers');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'followers':
        comparison = a.followers_count - b.followers_count;
        break;
      case 'time':
        comparison = new Date(a.declared_at).getTime() - new Date(b.declared_at).getTime();
        break;
      case 'bonus':
        comparison = a.bonus_multiplier - b.bonus_multiplier;
        break;
      case 'name':
        comparison = a.twitter_username.localeCompare(b.twitter_username);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (date: string): string => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}m ago`;
  };

  const SortButton = ({ column, label }: { column: SortBy; label: string }) => (
    <button
      onClick={() => handleSort(column)}
      className="font-bold text-xs hover:text-foreground transition-colors flex items-center gap-1"
    >
      {label}
      {sortBy === column && (
        <span className="text-xs">{sortOrder === 'desc' ? '▼' : '▲'}</span>
      )}
    </button>
  );

  // Show only first 3 if not expanded
  const displayMembers = isExpanded ? sortedMembers : sortedMembers.slice(0, 3);

  return (
    <div className="space-y-2">
      {/* Sort Controls */}
      {isExpanded && (
        <div className="flex gap-4 text-muted-foreground pb-2 border-b-2 border-border">
          <SortButton column="followers" label="FOLLOWERS" />
          <SortButton column="time" label="JOIN TIME" />
          <SortButton column="bonus" label="BONUS" />
          <SortButton column="name" label="NAME" />
        </div>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {displayMembers.map((member) => (
          <div
            key={member.twitter_username}
            className="flex items-center gap-3 p-3 bg-background/50 border-2 border-border hover:border-primary transition-all"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {member.profile_picture ? (
                <img
                  src={member.profile_picture}
                  alt={member.twitter_name}
                  className="w-10 h-10 rounded-full border-2 border-border object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center font-bold"
                  style={{ backgroundColor: teamColor + '20' }}
                >
                  {member.twitter_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Member Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <a
                  href={`https://x.com/${member.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-foreground hover:underline truncate"
                >
                  @{member.twitter_username}
                </a>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono">
                  {formatNumber(member.followers_count)} followers
                </span>
                <span>•</span>
                <span title={new Date(member.declared_at).toLocaleString()}>
                  Joined {formatTimeAgo(member.declared_at)}
                </span>
              </div>
            </div>

            {/* Bonus Badge */}
            <div className="flex-shrink-0">
              <BonusMultiplierBadge multiplier={member.bonus_multiplier} size="sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Show More Indicator */}
      {!isExpanded && members.length > 3 && (
        <div className="text-center text-xs text-muted-foreground py-2">
          +{members.length - 3} more members • Click team to expand
        </div>
      )}
    </div>
  );
}
