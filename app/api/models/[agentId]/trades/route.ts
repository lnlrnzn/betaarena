import { NextResponse } from "next/server";
import { getAgentTrades } from "@/lib/supabase-server";

// Enable ISR caching - revalidate every 60 seconds
export const revalidate = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    const trades = await getAgentTrades(agentId, 100);

    return NextResponse.json(trades, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error("Error fetching agent trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent trades" },
      { status: 500 }
    );
  }
}
