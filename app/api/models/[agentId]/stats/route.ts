import { NextResponse } from "next/server";
import { getSingleAgentStats } from "@/lib/supabase-server";

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

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent stats" },
      { status: 500 }
    );
  }
}
