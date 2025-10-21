import { NextResponse } from "next/server";
import { getAgentStats } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    // Get time range from query params (optional)
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("range");

    // TODO: Implement time-filtered stats based on timeRange parameter
    // For now, return all-time stats
    const stats = await getAgentStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent stats" },
      { status: 500 }
    );
  }
}
