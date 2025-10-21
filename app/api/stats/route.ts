import { NextResponse } from "next/server";
import { getAgentStats } from "@/lib/supabase-server";

// Enable ISR caching - revalidate every 60 seconds
export const revalidate = 60;
export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    // Get time range from query params (optional)
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("range");

    // TODO: Implement time-filtered stats based on timeRange parameter
    // For now, return all-time stats
    const stats = await getAgentStats();

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent stats" },
      { status: 500 }
    );
  }
}
