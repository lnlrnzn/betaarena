"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRealtime } from "./providers/realtime-provider";
import { AgentAvatar } from "@/components/agent-avatar";
import { SupportTeamModal } from "@/components/support-team-modal";
import { BonusMultiplierBadge } from "@/components/bonus-multiplier-badge";
import { MemberSearchBar } from "@/components/member-search-bar";
import { TeamMembersTable, TeamMember } from "@/components/team-members-table";
import { TeamCardCompact } from "@/components/team-card-compact";
import { RewardPoolDisplay } from "@/components/reward-pool-display";
import { AGENTS } from "@/lib/constants";

interface TeamData {
  rank: number;
  agent_id: string;
  agent_name: string;
  agent_model: string;
  total_members: number;
  total_followers: number;
  total_following: number;
  all_members: TeamMember[];
  avg_bonus_multiplier: number;
  is_eliminated: boolean;
  eliminated_at: string | null;
  elimination_order: number | null;
}

interface TeamStatsResponse {
  cycle_id: string;
  cycle_number: number;
  cycle_start_date: string;
  teams: TeamData[];
}

interface TeamsClientProps {
  initialTeamStats: TeamStatsResponse | null;
}

export function TeamsClient({ initialTeamStats }: TeamsClientProps) {
  const [teamStats, setTeamStats] = useState<TeamStatsResponse | null>(initialTeamStats);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  // Real-time update from global context
  const { latestTeamDeclaration } = useRealtime();

  useEffect(() => {
    if (!latestTeamDeclaration) return;
    if (!teamStats?.cycle_id) return;
    if (latestTeamDeclaration.cycle_id !== teamStats.cycle_id) return; // Filter by cycle

    console.log('New team member joined:', latestTeamDeclaration);

    // Fetch updated team stats
    fetchTeamStats();
  }, [latestTeamDeclaration, teamStats?.cycle_id]);

  // Fallback: If all_members is missing (old API response), fetch from client
  useEffect(() => {
    if (teamStats && teamStats.teams.some(t => !t.all_members)) {
      console.log('all_members missing, fetching from client...');
      fetchTeamStats();
    }
  }, [teamStats]);

  const fetchTeamStats = async () => {
    try {
      const response = await fetch('/api/teams/stats');
      if (response.ok) {
        const data = await response.json();
        setTeamStats(data);
      }
    } catch (error) {
      console.error('Error fetching team stats:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    }
  };

  const formatEliminationOrder = (order: number): string => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = order % 100;
    return order + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]).toUpperCase();
  };

  const getAgent = (agentModel: string) => {
    return Object.values(AGENTS).find(a => a.model === agentModel);
  };

  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  // Filter teams and members by search query
  const filterMembers = (members: TeamMember[]) => {
    if (!searchQuery.trim()) return members;

    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.twitter_username.toLowerCase().includes(query) ||
        m.twitter_name.toLowerCase().includes(query)
    );
  };

  // Calculate total filtered members
  const totalMembers = teamStats?.teams.reduce((sum, t) => sum + (t.all_members?.length || 0), 0) || 0;
  const filteredMembersCount = teamStats?.teams.reduce(
    (sum, t) => sum + filterMembers(t.all_members || []).length,
    0
  ) || 0;

  // Filter teams - show all teams, but filter members by search
  const filteredTeams = teamStats?.teams.map(team => ({
    ...team,
    filtered_members: filterMembers(team.all_members || []),
  }));

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading teams...</p>
            </div>
          ) : teamStats && teamStats.teams.length > 0 ? (
            <div className="space-y-4">
              {/* Top Bar: Search + Reward Pool */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MemberSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  totalMembers={totalMembers}
                  filteredCount={filteredMembersCount}
                />
                <RewardPoolDisplay />
              </div>

              {/* Cycle Info */}
              <div className="border-2 border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">
                  Season {teamStats.cycle_number} •{' '}
                  {filteredTeams?.length || 0} Teams •{' '}
                  {filteredMembersCount} Members
                  {searchQuery && ` (filtered)`}
                </div>
              </div>

              {/* Teams Leaderboard */}
              <div className="space-y-2">
                {filteredTeams && filteredTeams.map((team) => {
                  const agent = getAgent(team.agent_model);
                  if (!agent) return null;

                  const isExpanded = expandedTeams.has(team.agent_id);
                  const membersToShow = team.filtered_members;
                  const displayMembers = searchQuery ? membersToShow.length : team.total_members;

                  return (
                    <div key={team.agent_id} className="space-y-2">
                      {/* Team Row */}
                      <div
                        className={`border-4 border-border bg-card hover:border-primary transition-all cursor-pointer group ${
                          team.is_eliminated ? 'opacity-60 grayscale' : ''
                        }`}
                        onClick={() => toggleTeam(team.agent_id)}
                      >
                        <div className="p-4 flex items-center gap-4">
                          {/* Rank Badge with Elimination Indicator */}
                          <div className="flex-shrink-0">
                            {team.is_eliminated && team.elimination_order ? (
                              <div className="w-12 h-12 border-4 border-red-500 bg-red-100 dark:bg-red-900 flex flex-col items-center justify-center font-bold text-xs">
                                <div className="text-red-600 dark:text-red-300">OUT</div>
                                <div className="text-red-600 dark:text-red-300">#{team.elimination_order}</div>
                              </div>
                            ) : (
                              <div
                                className="w-12 h-12 border-4 border-border bg-background flex items-center justify-center font-bold text-lg"
                                style={{ borderColor: agent.color }}
                              >
                                #{team.rank}
                              </div>
                            )}
                          </div>

                          {/* Agent Avatar & Name */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <AgentAvatar
                              logo={agent.logo}
                              logoFallback={agent.logoFallback}
                              name={agent.name}
                              color={agent.color}
                              size={40}
                            />
                            <div className="min-w-0">
                              <h3 className="font-bold text-lg text-foreground truncate">
                                {agent.name}
                                {team.is_eliminated && team.elimination_order && (
                                  <span className="ml-2 text-sm font-normal text-red-500">
                                    [{formatEliminationOrder(team.elimination_order)} ELIMINATED]
                                  </span>
                                )}
                              </h3>
                              <div className="text-xs text-muted-foreground">
                                {team.is_eliminated && team.eliminated_at ? (
                                  <>Eliminated {formatTimeAgo(new Date(team.eliminated_at))}</>
                                ) : (
                                  <>Click to {isExpanded ? 'hide' : 'view'} members</>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="hidden md:flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Members</div>
                              <div className="text-xl font-bold text-foreground">{displayMembers}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Followers</div>
                              <div className="text-xl font-bold text-foreground">
                                {formatNumber(team.total_followers)}
                              </div>
                            </div>
                            <div className="text-center">
                              <BonusMultiplierBadge multiplier={team.avg_bonus_multiplier} size="lg" />
                            </div>
                          </div>

                          {/* Mobile Stats */}
                          <div className="md:hidden flex flex-col gap-1 text-right">
                            <div className="text-sm font-bold">{displayMembers} members</div>
                            <BonusMultiplierBadge multiplier={team.avg_bonus_multiplier} size="sm" />
                          </div>

                          {/* Join Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!team.is_eliminated) {
                                setSelectedAgent(team.agent_model);
                              }
                            }}
                            disabled={team.is_eliminated}
                            className={`px-6 py-3 border-4 font-bold text-sm transition-all whitespace-nowrap ${
                              team.is_eliminated
                                ? 'opacity-40 cursor-not-allowed bg-gray-400 border-gray-400 text-gray-700'
                                : 'hover:opacity-90'
                            }`}
                            style={
                              !team.is_eliminated
                                ? {
                                    borderColor: agent.color,
                                    backgroundColor: agent.color,
                                    color: '#ffffff',
                                  }
                                : undefined
                            }
                          >
                            {team.is_eliminated ? 'ELIMINATED' : 'JOIN'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Members Section */}
                      {isExpanded && membersToShow.length > 0 && (
                        <div className="border-4 border-border bg-card/50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-foreground">
                              {agent.name} Members ({membersToShow.length})
                            </h4>
                            <button
                              onClick={() => toggleTeam(team.agent_id)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              Close ✕
                            </button>
                          </div>
                          <TeamMembersTable
                            members={membersToShow}
                            teamColor={agent.color}
                            isExpanded={true}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No teams available yet</p>
            </div>
          )}
        </div>
      </main>

      {/* Join Team Modal */}
      {selectedAgent && getAgent(selectedAgent) && (
        <SupportTeamModal
          agent={getAgent(selectedAgent)!}
          isOpen={true}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </>
  );
}
