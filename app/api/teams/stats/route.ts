import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { AGENTS } from "@/lib/constants";

export const revalidate = 30; // Cache for 30 seconds

export async function GET() {
  try {
    // Get active cycle
    const { data: activeCycle } = await supabaseServer
      .from("cycles")
      .select("id, cycle_number")
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

    // Build response with ALL 7 agents, merge with team_stats data
    const teams = Object.values(AGENTS)
      .map((agent) => {
        // Find matching stats from database, default to 0 if no members yet
        const stat = (teamStats || []).find((s) => s.agent_id === agent.id);
        return {
          agent_id: agent.id,
          agent_name: agent.name,
          agent_model: agent.model,
          total_members: stat?.total_members || 0,
          total_followers: stat?.total_followers || 0,
          total_following: stat?.total_following || 0,
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
