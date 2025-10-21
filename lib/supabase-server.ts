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
 */
export async function getAgentStats(): Promise<AgentStats[]> {
  const agentIds = Object.values(AGENTS).map((a) => a.id);

  // Get latest and first snapshot for each agent
  const statsPromises = agentIds.map(async (agentId) => {
    // Get latest snapshot
    const { data: latestSnapshot } = await supabaseServer
      .from('portfolio_snapshots')
      .select('total_portfolio_value_usd, timestamp')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // Get first snapshot (starting value)
    const { data: firstSnapshot } = await supabaseServer
      .from('portfolio_snapshots')
      .select('total_portfolio_value_usd, timestamp')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: true })
      .limit(1)
      .single();

    // Get trade count
    const { count: totalTrades } = await supabaseServer
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId);

    // Get winning trades (where pnl_usd > 0)
    const { count: winningTrades } = await supabaseServer
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)
      .eq('status', 'closed')
      .gt('pnl_usd', 0);

    const currentValue = latestSnapshot?.total_portfolio_value_usd
      ? parseFloat(latestSnapshot.total_portfolio_value_usd)
      : 0;

    const startingValue = firstSnapshot?.total_portfolio_value_usd
      ? parseFloat(firstSnapshot.total_portfolio_value_usd)
      : 0;

    const change = currentValue - startingValue;
    const changePercent = startingValue > 0 ? (change / startingValue) * 100 : 0;

    const winRate =
      totalTrades && totalTrades > 0 && winningTrades
        ? (winningTrades / totalTrades) * 100
        : 0;

    return {
      agent_id: agentId,
      currentValue,
      startingValue,
      change,
      changePercent,
      totalTrades: totalTrades || 0,
      winRate,
      avgHoldTime: '0m', // TODO: Calculate from trades
    };
  });

  const stats = await Promise.all(statsPromises);
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
 */
export async function getSingleAgentStats(agentId: string): Promise<AgentStats | null> {
  // Get latest snapshot
  const { data: latestSnapshot } = await supabaseServer
    .from('portfolio_snapshots')
    .select('total_portfolio_value_usd, timestamp')
    .eq('agent_id', agentId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  // Get first snapshot (starting value)
  const { data: firstSnapshot } = await supabaseServer
    .from('portfolio_snapshots')
    .select('total_portfolio_value_usd, timestamp')
    .eq('agent_id', agentId)
    .order('timestamp', { ascending: true })
    .limit(1)
    .single();

  // Get trade count
  const { count: totalTrades } = await supabaseServer
    .from('trades')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agentId);

  // Get winning trades (where pnl_usd > 0)
  const { count: winningTrades } = await supabaseServer
    .from('trades')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agentId)
    .eq('status', 'closed')
    .gt('pnl_usd', 0);

  if (!latestSnapshot || !firstSnapshot) {
    return null;
  }

  const currentValue = parseFloat(latestSnapshot.total_portfolio_value_usd);
  const startingValue = parseFloat(firstSnapshot.total_portfolio_value_usd);
  const change = currentValue - startingValue;
  const changePercent = startingValue > 0 ? (change / startingValue) * 100 : 0;
  const winRate =
    totalTrades && totalTrades > 0 && winningTrades
      ? (winningTrades / totalTrades) * 100
      : 0;

  return {
    agent_id: agentId,
    currentValue,
    startingValue,
    change,
    changePercent,
    totalTrades: totalTrades || 0,
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

  // Get holdings for this snapshot
  const { data: holdings } = await supabaseServer
    .from('portfolio_holdings')
    .select(`
      token_address,
      token_name,
      token_symbol,
      token_image_url,
      token_amount,
      value_usd,
      price_usd
    `)
    .eq('snapshot_id', latestSnapshot.id)
    .gt('token_amount', 0);

  return {
    solBalance: latestSnapshot.sol_balance ? parseFloat(latestSnapshot.sol_balance) : 0,
    totalValue: parseFloat(latestSnapshot.total_portfolio_value_usd),
    holdings: holdings || [],
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
