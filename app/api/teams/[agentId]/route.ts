import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const revalidate = 30; // Cache for 30 seconds

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { searchParams } = new URL(request.url);

    // Pagination params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100); // Max 100
    const offset = (page - 1) * limit;

    // Get active cycle
    const { data: activeCycle } = await supabaseServer
      .from("cycles")
      .select("id")
      .eq("is_active", true)
      .single();

    if (!activeCycle) {
      return NextResponse.json(
        { error: "No active cycle" },
        { status: 404 }
      );
    }

    // Get team stats from view
    const { data: stats } = await supabaseServer
      .from("team_stats")
      .select("total_members, total_followers, total_following")
      .eq("cycle_id", activeCycle.id)
      .eq("agent_id", agentId)
      .single();

    const teamStats = stats || {
      total_members: 0,
      total_followers: 0,
      total_following: 0,
    };

    // Get paginated members
    const { data: members, error, count } = await supabaseServer
      .from("team_declarations")
      .select(
        `
        id,
        twitter_username,
        twitter_name,
        profile_picture,
        followers_count,
        following_count,
        declared_at,
        tweet_url
      `,
        { count: "exact" }
      )
      .eq("cycle_id", activeCycle.id)
      .eq("agent_id", agentId)
      .order("declared_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      agent_id: agentId,
      stats: teamStats,
      members: members || [],
      pagination: {
        page,
        limit,
        total_pages: totalPages,
        total_count: totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching team data:", error);
    return NextResponse.json(
      { error: "Failed to fetch team data" },
      { status: 500 }
    );
  }
}
