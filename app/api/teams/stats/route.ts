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

    // Build response with agent names and sorted by total members
    const teams = (teamStats || [])
      .map((stat) => {
        const agent = Object.values(AGENTS).find((a) => a.id === stat.agent_id);
        return {
          agent_id: stat.agent_id,
          agent_name: agent?.name || "Unknown",
          agent_model: agent?.model || "unknown",
          total_members: stat.total_members,
          total_followers: stat.total_followers,
          total_following: stat.total_following,
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
