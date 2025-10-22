"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRealtime } from "./providers/realtime-provider";
import { AgentAvatar } from "@/components/agent-avatar";
import { JoinTeamModal } from "@/components/join-team-modal";
import { AGENTS } from "@/lib/constants";

interface TeamData {
  rank: number;
  agent_id: string;
  agent_name: string;
  agent_model: string;
  total_members: number;
  total_followers: number;
  total_following: number;
}

interface TeamStatsResponse {
  cycle_id: string;
  cycle_number: number;
  teams: TeamData[];
}

interface TeamsClientProps {
  initialTeamStats: TeamStatsResponse | null;
}

export function TeamsClient({ initialTeamStats }: TeamsClientProps) {
  const [teamStats, setTeamStats] = useState<TeamStatsResponse | null>(initialTeamStats);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const getAgent = (agentModel: string) => {
    return Object.values(AGENTS).find(a => a.model === agentModel);
  };

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading teams...</p>
            </div>
          ) : teamStats && teamStats.teams.length > 0 ? (
            <div className="space-y-4">
              {/* Cycle Info */}
              <div className="border-2 border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">
                  Season {teamStats.cycle_number} • {teamStats.teams.reduce((sum, t) => sum + t.total_members, 0)} Total Members
                </div>
              </div>

              {/* Teams List */}
              {teamStats.teams.map((team) => {
                const agent = getAgent(team.agent_model);
                if (!agent) return null;

                return (
                  <div
                    key={team.agent_id}
                    className="border-4 border-border bg-background hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-4 p-4 md:p-6">
                      {/* Rank Badge */}
                      <div
                        className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 border-4 border-border bg-card flex items-center justify-center"
                        style={{ borderColor: agent.color }}
                      >
                        <span className="text-xl md:text-2xl font-bold text-foreground">
                          #{team.rank}
                        </span>
                      </div>

                      {/* Color Bar */}
                      <div
                        className="flex-shrink-0 w-2 h-16 md:h-20 border-2 border-border"
                        style={{ backgroundColor: agent.color }}
                      />

                      {/* Agent Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <AgentAvatar
                            logo={agent.logo}
                            logoFallback={agent.logoFallback}
                            name={agent.name}
                            color={agent.color}
                            size={40}
                          />
                          <h2 className="text-lg md:text-xl font-bold text-foreground truncate">
                            {agent.name}
                          </h2>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground">
                          <div>
                            <span className="font-bold text-foreground">{team.total_members}</span>
                            {' '}Members
                          </div>
                          <div>
                            <span className="font-bold text-foreground">{formatNumber(team.total_followers)}</span>
                            {' '}Followers
                          </div>
                        </div>
                      </div>

                      {/* Join Button */}
                      <button
                        onClick={() => setSelectedAgent(team.agent_model)}
                        className="flex-shrink-0 px-4 md:px-6 py-2 md:py-3 border-4 font-bold text-sm md:text-base transition-all hover:opacity-90"
                        style={{
                          borderColor: agent.color,
                          backgroundColor: agent.color,
                          color: "#ffffff",
                        }}
                      >
                        JOIN
                      </button>
                    </div>
                  </div>
                );
              })}
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
        <JoinTeamModal
          agent={getAgent(selectedAgent)!}
          isOpen={true}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </>
  );
}
