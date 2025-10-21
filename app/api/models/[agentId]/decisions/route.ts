import { NextResponse } from "next/server";
import { getAgentActivities } from "@/lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    const activities = await getAgentActivities(agentId, 100);

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching agent decisions:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent decisions" },
      { status: 500 }
    );
  }
}
