import { NextResponse } from "next/server";
import { getAgentPositions } from "@/lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    const positions = await getAgentPositions(agentId);

    return NextResponse.json(positions);
  } catch (error) {
    console.error("Error fetching agent positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent positions" },
      { status: 500 }
    );
  }
}
