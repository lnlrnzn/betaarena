import { createClient } from "@supabase/supabase-js";
import { AgentStats } from "./types";
import { AGENTS } from "./constants";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_KEY is not set");
}

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

/**
 * Get real-time agent statistics from Supabase
 * Optimized to fetch only first/last snapshots per agent instead of all snapshots
 */
export async function getAgentStats(): Promise<AgentStats[]> {
  const agentIds = Object.values(AGENTS).map((a) => a.id);

  // Optimized: Fetch first and last snapshots per agent in parallel
  const snapshotQueries = agentIds.flatMap((agentId) => [
    // First snapshot for this agent
    supabaseServer
      .from('portfolio_snapshots')
      .select('agent_id, total_portfolio_value_usd')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: true })
      .limit(1)
      .single()
      .then(res => ({ ...res.data, type: 'first' as const })),

    // Latest snapshot for this agent
    supabaseServer
      .from('portfolio_snapshots')
      .select('agent_id, total_portfolio_value_usd')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()
      .then(res => ({ ...res.data, type: 'latest' as const })),
  ]);

  // Get trade statistics for all agents
  const tradesQuery = supabaseServer
    .from('trades')
    .select('agent_id, status, pnl_usd')
    .in('agent_id', agentIds);

  // Execute all queries in parallel
  const [snapshots, tradesResult] = await Promise.all([
    Promise.all(snapshotQueries),
    tradesQuery,
  ]);

  const tradeStats = tradesResult.data || [];

  // Build maps for first and latest snapshots
  const firstSnapshots = new Map<string, number>();
  const latestSnapshots = new Map<string, number>();

  snapshots.forEach((snapshot) => {
    if (snapshot && snapshot.agent_id && snapshot.total_portfolio_value_usd) {
      const value = parseFloat(snapshot.total_portfolio_value_usd);
      if (snapshot.type === 'first') {
        firstSnapshots.set(snapshot.agent_id, value);
      } else {
        latestSnapshots.set(snapshot.agent_id, value);
      }
    }
  });

  // Process trade statistics for each agent
  const agentTradeStats = new Map<string, { total: number; wins: number }>();

  agentIds.forEach((agentId) => {
    const agentTrades = tradeStats.filter((t) => t.agent_id === agentId);
    const totalTrades = agentTrades.length;
    const winningTrades = agentTrades.filter(
      (t) => t.status === 'closed' && parseFloat(t.pnl_usd || '0') > 0
    ).length;

    agentTradeStats.set(agentId, { total: totalTrades, wins: winningTrades });
  });

  // Build stats array for each agent
  const stats = agentIds.map((agentId) => {
    const currentValue = latestSnapshots.get(agentId) || 0;
    const startingValue = firstSnapshots.get(agentId) || 0;
    const change = currentValue - startingValue;
    const changePercent = startingValue > 0 ? (change / startingValue) * 100 : 0;

    const trades = agentTradeStats.get(agentId) || { total: 0, wins: 0 };
    const winRate = trades.total > 0 ? (trades.wins / trades.total) * 100 : 0;

    return {
      agent_id: agentId,
      currentValue,
      startingValue,
      change,
      changePercent,
      totalTrades: trades.total,
      winRate,
      avgHoldTime: '0m', // TODO: Calculate from trades
    };
  });

  return stats;
}

/**
 * Get latest completed trades from Supabase
 */
export async function getLatestTrades(limit: number = 20) {
  const { data: trades, error } = await supabaseServer
    .from('trades')
    .select(`
      id,
      agent_id,
      token_address,
      token_name,
      token_symbol,
      token_image_url,
      side,
      token_amount,
      price_usd,
      price_at_exit,
      volume_usd,
      volume_sol,
      timestamp,
      exit_timestamp,
      pnl_sol,
      pnl_usd,
      pnl_percentage,
      holding_time_minutes,
      status
    `)
    .eq('status', 'closed')
    .order('exit_timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching trades:', error);
    return [];
  }

  return trades || [];
}

/**
 * Get latest agent activities from Supabase
 */
export async function getLatestActivities(limit: number = 50) {
  const { data: activities, error } = await supabaseServer
    .from('agent_activities')
    .select(`
      id,
      agent_id,
      activity_type,
      description,
      timestamp,
      metadata,
      target_agent_id,
      target_resource
    `)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }

  return activities || [];
}

/**
 * Get statistics for a single agent
 * Optimized to batch queries instead of making 4 separate queries
 */
export async function getSingleAgentStats(agentId: string): Promise<AgentStats | null> {
  // Optimized: Fetch only first and last snapshots instead of all 1,560+
  const [firstSnapshotResult, latestSnapshotResult, trades] = await Promise.all([
    // Query 1: Get first snapshot
    supabaseServer
      .from('portfolio_snapshots')
      .select('total_portfolio_value_usd')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: true })
      .limit(1)
      .single(),

    // Query 2: Get latest snapshot
    supabaseServer
      .from('portfolio_snapshots')
      .select('total_portfolio_value_usd')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single(),

    // Query 3: Get all trades for statistics
    supabaseServer
      .from('trades')
      .select('status, pnl_usd')
      .eq('agent_id', agentId),
  ]);

  if (!firstSnapshotResult.data || !latestSnapshotResult.data) {
    return null;
  }

  const firstSnapshot = firstSnapshotResult.data;
  const latestSnapshot = latestSnapshotResult.data;

  // Calculate trade statistics
  const totalTrades = trades.data?.length || 0;
  const winningTrades = trades.data?.filter(
    (t) => t.status === 'closed' && parseFloat(t.pnl_usd || '0') > 0
  ).length || 0;

  const currentValue = parseFloat(latestSnapshot.total_portfolio_value_usd);
  const startingValue = parseFloat(firstSnapshot.total_portfolio_value_usd);
  const change = currentValue - startingValue;
  const changePercent = startingValue > 0 ? (change / startingValue) * 100 : 0;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  return {
    agent_id: agentId,
    currentValue,
    startingValue,
    change,
    changePercent,
    totalTrades,
    winRate,
    avgHoldTime: '0m', // TODO: Calculate from trades
  };
}

/**
 * Get trades for a specific agent
 */
export async function getAgentTrades(agentId: string, limit: number = 100) {
  const { data: trades, error } = await supabaseServer
    .from('trades')
    .select(`
      id,
      agent_id,
      token_address,
      token_name,
      token_symbol,
      token_image_url,
      side,
      token_amount,
      price_usd,
      price_at_exit,
      volume_usd,
      volume_sol,
      timestamp,
      exit_timestamp,
      pnl_sol,
      pnl_usd,
      pnl_percentage,
      holding_time_minutes,
      status
    `)
    .eq('agent_id', agentId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching agent trades:', error);
    return [];
  }

  return trades || [];
}

/**
 * Get activities/decisions for a specific agent
 */
export async function getAgentActivities(agentId: string, limit: number = 100) {
  const { data: activities, error } = await supabaseServer
    .from('agent_activities')
    .select(`
      id,
      agent_id,
      activity_type,
      description,
      timestamp,
      metadata,
      target_agent_id,
      target_resource
    `)
    .eq('agent_id', agentId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching agent activities:', error);
    return [];
  }

  return activities || [];
}

/**
 * Get current positions for a specific agent
 */
export async function getAgentPositions(agentId: string) {
  // Get latest snapshot
  const { data: latestSnapshot } = await supabaseServer
    .from('portfolio_snapshots')
    .select('id, sol_balance, total_portfolio_value_usd')
    .eq('agent_id', agentId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (!latestSnapshot) {
    return {
      solBalance: 0,
      totalValue: 0,
      holdings: [],
    };
  }

  // Get latest SOL price for USD conversion
  const { data: latestSolPrice } = await supabaseServer
    .from('sol_price_history')
    .select('price_usd')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  const solPriceUSD = latestSolPrice ? parseFloat(latestSolPrice.price_usd) : 191.5;

  // Get holdings for this snapshot with correct column names
  const { data: holdings } = await supabaseServer
    .from('portfolio_holdings')
    .select(`
      token_address,
      token_name,
      token_symbol,
      token_image_url,
      token_amount,
      value_in_usd,
      current_price_sol
    `)
    .eq('snapshot_id', latestSnapshot.id)
    .gt('token_amount', 0);

  return {
    solBalance: latestSnapshot.sol_balance ? parseFloat(latestSnapshot.sol_balance) : 0,
    totalValue: parseFloat(latestSnapshot.total_portfolio_value_usd),
    holdings: (holdings || []).map(h => ({
      token_address: h.token_address,
      token_name: h.token_name,
      token_symbol: h.token_symbol,
      token_image_url: h.token_image_url,
      token_amount: h.token_amount,
      value_usd: h.value_in_usd,  // Map DB column to expected interface
      price_usd: (parseFloat(h.current_price_sol) * solPriceUSD).toFixed(10).toString(),  // Convert SOL → USD
    })),
  };
}

/**
 * Get the active cycle
 */
export async function getActiveCycle() {
  const { data: activeCycle, error } = await supabaseServer
    .from('cycles')
    .select('id, cycle_number, start_date, end_date, is_active')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching active cycle:', error);
    return null;
  }

  return activeCycle;
}

/**
 * Get team stats for a specific agent in the active cycle
 */
export async function getTeamStats(agentId: string) {
  const activeCycle = await getActiveCycle();
  if (!activeCycle) return null;

  const { data: stats } = await supabaseServer
    .from('team_stats')
    .select('total_members, total_followers, total_following')
    .eq('cycle_id', activeCycle.id)
    .eq('agent_id', agentId)
    .single();

  return stats || { total_members: 0, total_followers: 0, total_following: 0 };
}

/**
 * Get team members for a specific agent with pagination
 */
export async function getTeamMembers(agentId: string, page: number = 1, limit: number = 50) {
  const activeCycle = await getActiveCycle();
  if (!activeCycle) return [];

  const offset = (page - 1) * limit;

  const { data: members } = await supabaseServer
    .from('team_declarations')
    .select(`
      id,
      twitter_username,
      twitter_name,
      profile_picture,
      followers_count,
      following_count,
      declared_at,
      tweet_url
    `)
    .eq('cycle_id', activeCycle.id)
    .eq('agent_id', agentId)
    .order('declared_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return members || [];
}

/**
 * Get all model page data in a single server fetch
 * Optimized to prevent client-side waterfalls
 */
export async function getModelPageData(agentId: string) {
  // Fetch all data in parallel
  const [stats, trades, activities, positions, teamStats, teamMembers] = await Promise.all([
    getSingleAgentStats(agentId),
    getAgentTrades(agentId, 100),
    getAgentActivities(agentId, 100),
    getAgentPositions(agentId),
    getTeamStats(agentId),
    getTeamMembers(agentId, 1, 50),
  ]);

  return {
    stats,
    trades,
    activities,
    positions,
    teamStats,
    teamMembers,
  };
}
