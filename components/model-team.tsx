"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Agent } from "@/lib/constants";
import { JoinTeamModal } from "./join-team-modal";
import { TeamMemberCard } from "./team-member-card";

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

interface TeamStats {
  total_members: number;
  total_followers: number;
  total_following: number;
}

interface ModelTeamProps {
  agentId: string;
  agent: Agent;
  initialStats: TeamStats | null;
  initialMembers: TeamMember[];
}

export function ModelTeam({ agentId, agent, initialStats, initialMembers }: ModelTeamProps) {
  const [stats, setStats] = useState<TeamStats>(
    initialStats || { total_members: 0, total_followers: 0, total_following: 0 }
  );
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialMembers.length >= 50);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Fetch team data for pagination
  const fetchTeamData = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${agentId}?page=${pageNum}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setMembers((prev) => [...prev, ...data.members]);
        setHasMore(data.pagination.page < data.pagination.total_pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`team-${agentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_declarations',
          filter: `agent_id=eq.${agentId}`,
        },
        (payload) => {
          console.log('New team member:', payload);

          // Add new member to top of list
          const newMember = payload.new as TeamMember;
          setMembers((prev) => [newMember, ...prev]);

          // Update stats
          setStats((prev) => ({
            total_members: prev.total_members + 1,
            total_followers: prev.total_followers + (newMember.followers_count || 0),
            total_following: prev.total_following + (newMember.following_count || 0),
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId]);

  const handleLoadMore = () => {
    fetchTeamData(page + 1);
  };

  return (
    <>
      <div className="h-full bg-background overflow-y-auto">
        {/* Sticky Header with Join Button */}
        <div className="sticky top-0 z-10 bg-background border-b-2 border-border">
          <div className="p-4">
            <button
              onClick={() => setShowJoinModal(true)}
              className="block w-full px-6 py-4 border-4 text-center font-bold text-lg transition-all hover:opacity-90"
              style={{
                borderColor: agent.color,
                backgroundColor: agent.color,
                color: "#ffffff",
              }}
            >
              JOIN {agent.shortName.toUpperCase()}&apos;S TEAM →
            </button>
          </div>
        </div>

      {/* Team Stats */}
      <div className="p-4 border-b-2 border-border bg-card">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.total_members.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Team Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {stats.total_followers.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Combined Followers</div>
          </div>
          <div className="text-center hidden md:block">
            <div className="text-2xl font-bold text-foreground">
              {stats.total_following.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Combined Following</div>
          </div>
        </div>
      </div>

      {/* Members Feed */}
      <div className="p-4">
        {isLoading && members.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Loading team members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No team members yet</p>
              <p className="text-xs text-muted-foreground">
                Be the first to join {agent.shortName}&apos;s team!
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {members.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-2 border-2 border-border bg-background text-foreground hover:bg-muted font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>

    {/* Join Team Modal */}
    <JoinTeamModal
      agent={agent}
      isOpen={showJoinModal}
      onClose={() => setShowJoinModal(false)}
    />
    </>
  );
}
