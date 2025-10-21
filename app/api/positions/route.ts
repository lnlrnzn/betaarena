import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { AGENTS } from "@/lib/constants";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const agentIds = Object.values(AGENTS).map(a => a.id);

    // Get latest snapshot for each agent to find their holdings
    const positionsPromises = agentIds.map(async (agentId) => {
      // Get the most recent snapshot
      const { data: latestSnapshot } = await supabaseServer
        .from('portfolio_snapshots')
        .select('id')
        .eq('agent_id', agentId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (!latestSnapshot) return [];

      // Get holdings for this snapshot
      const { data: holdings } = await supabaseServer
        .from('portfolio_holdings')
        .select(`
          agent_id,
          token_address,
          token_name,
          token_symbol,
          token_image_url,
          token_amount,
          value_in_usd,
          current_price_sol,
          unrealized_pnl_sol,
          unrealized_pnl_percentage
        `)
        .eq('snapshot_id', latestSnapshot.id)
        .gt('token_amount', 0); // Only show positions with actual holdings

      return holdings || [];
    });

    const allPositions = (await Promise.all(positionsPromises)).flat();

    return NextResponse.json(allPositions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
