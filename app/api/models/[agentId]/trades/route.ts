import { NextResponse } from "next/server";
import { getAgentTrades } from "@/lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    const trades = await getAgentTrades(agentId, 100);

    return NextResponse.json(trades);
  } catch (error) {
    console.error("Error fetching agent trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent trades" },
      { status: 500 }
    );
  }
}
