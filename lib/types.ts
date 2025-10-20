export interface PortfolioSnapshot {
  id: string;
  agent_id: string;
  timestamp: string;
  sol_balance: number;
  token_holdings_value_sol: number;
  total_portfolio_value_sol: number;
  total_portfolio_value_usd: number;
  unrealized_pnl_sol: number;
  unrealized_pnl_usd: number;
  realized_pnl_sol: number;
  realized_pnl_usd: number;
  num_open_positions: number;
  created_at: string;
}

export interface SolPriceHistory {
  timestamp: string;
  price_usd: number;
}

export interface ChartDataPoint {
  timestamp: number;
  date: string;
  [agentId: string]: number | string; // agent_id: portfolio_value_usd
}

export interface AgentStats {
  agent_id: string;
  currentValue: number;
  startingValue: number;
  change: number;
  changePercent: number;
  totalTrades: number;
  winRate: number;
  avgHoldTime: string;
}
