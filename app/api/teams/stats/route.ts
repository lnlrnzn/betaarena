import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { AGENTS } from "@/lib/constants";
import { calculateBonusMultiplier } from "@/lib/bonus-calculator";

export const revalidate = 30; // Cache for 30 seconds

interface TopMember {
  twitter_username: string;
  twitter_name: string;
  profile_picture: string | null;
  followers_count: number;
  declared_at: string;
  bonus_multiplier: number;
}

export async function GET() {
  try {
    // Get active cycle with start_date for bonus calculation
    const { data: activeCycle } = await supabaseServer
      .from("cycles")
      .select("id, cycle_number, start_date")
      .eq("is_active", true)
      .single();

    if (!activeCycle) {
      return NextResponse.json(
        { error: "No active cycle" },
        { status: 404 }
      );
    }

    // Get stats for all teams from view
    const { data: teamStats } = await supabaseServer
      .from("team_stats")
      .select("agent_id, total_members, total_followers, total_following")
      .eq("cycle_id", activeCycle.id);

    // Get all team declarations for top members and bonus calculations
    const { data: declarations } = await supabaseServer
      .from("team_declarations")
      .select(
        "agent_id, twitter_username, twitter_name, profile_picture, followers_count, declared_at"
      )
      .eq("cycle_id", activeCycle.id)
      .order("followers_count", { ascending: false });

    // Build response with trading agents only (exclude SYSTEM)
    const teams = Object.values(AGENTS)
      .filter((agent) => agent.model !== 'system')
      .map((agent) => {
        // Find matching stats from database, default to 0 if no members yet
        const stat = (teamStats || []).find((s) => s.agent_id === agent.id);

        // Get ALL members for this team (not just top 3)
        const teamDeclarations = (declarations || [])
          .filter((d) => d.agent_id === agent.id)
          .map((d) => ({
            twitter_username: d.twitter_username,
            twitter_name: d.twitter_name,
            profile_picture: d.profile_picture,
            followers_count: d.followers_count,
            declared_at: d.declared_at,
            bonus_multiplier: calculateBonusMultiplier(
              d.declared_at,
              activeCycle.start_date
            ),
          }));

        // Calculate average bonus for the entire team
        const allTeamMembers = (declarations || []).filter(
          (d) => d.agent_id === agent.id
        );
        const avgBonus =
          allTeamMembers.length > 0
            ? allTeamMembers.reduce(
                (sum, d) =>
                  sum +
                  calculateBonusMultiplier(d.declared_at, activeCycle.start_date),
                0
              ) / allTeamMembers.length
            : 1.0;

        return {
          agent_id: agent.id,
          agent_name: agent.name,
          agent_model: agent.model,
          total_members: stat?.total_members || 0,
          total_followers: stat?.total_followers || 0,
          total_following: stat?.total_following || 0,
          all_members: teamDeclarations, // Changed from top_members to all_members
          avg_bonus_multiplier: Number(avgBonus.toFixed(2)),
        };
      })
      .sort((a, b) => b.total_members - a.total_members) // Sort by members descending
      .map((team, index) => ({
        ...team,
        rank: index + 1,
      }));

    return NextResponse.json({
      cycle_id: activeCycle.id,
      cycle_number: activeCycle.cycle_number,
      cycle_start_date: activeCycle.start_date,
      teams,
    });
  } catch (error) {
    console.error("Error fetching team stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch team stats" },
      { status: 500 }
    );
  }
}
