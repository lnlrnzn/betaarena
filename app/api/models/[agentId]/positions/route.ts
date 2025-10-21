import { NextResponse } from "next/server";
import { getAgentPositions } from "@/lib/supabase-server";

// Enable ISR caching - revalidate every 60 seconds
export const revalidate = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    const positions = await getAgentPositions(agentId);

    return NextResponse.json(positions, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error("Error fetching agent positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent positions" },
      { status: 500 }
    );
  }
}
