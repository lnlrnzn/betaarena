import { NextResponse } from "next/server";
import { getSingleAgentStats } from "@/lib/supabase-server";

// Enable ISR caching - revalidate every 60 seconds
export const revalidate = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    const stats = await getSingleAgentStats(agentId);

    if (!stats) {
      return NextResponse.json(
        { error: "Agent not found or no data available" },
        { status: 404 }
      );
    }

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
