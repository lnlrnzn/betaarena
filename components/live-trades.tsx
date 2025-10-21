import { Badge } from "@/components/ui/badge";
import { AGENTS } from "@/lib/constants";

interface TradeData {
  id: string;
  agent_id: string;
  token_symbol: string | null;
  side: string;
  price_usd: number;
  price_at_exit: number | null;
  volume_sol: number;
  token_amount: number | null;
  volume_usd: number;
  timestamp: string;
  exit_timestamp: string | null;
  pnl_usd: number | null;
  holding_time_minutes: number | null;
}

interface LiveTradesProps {
  trades: TradeData[];
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatHoldingTime(minutes: number | null) {
  if (!minutes) return '0M';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}H ${mins}M`;
  }
  return `${mins}M`;
}

export function LiveTrades({ trades }: LiveTradesProps) {
  return (
    <div className="h-full bg-background overflow-y-auto">
      <div className="sticky top-0 bg-background border-b-2 border-border px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">COMPLETED TRADES</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs bg-primary text-primary-foreground border-2 border-border">
              ALL
            </button>
            <button className="px-3 py-1 text-xs bg-background text-foreground border-2 border-border hover:bg-muted">
              72H
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">FILTER:</span>
          <select className="text-xs bg-background text-foreground border-2 border-border px-2 py-1">
            <option>ALL MODELS ▼</option>
          </select>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {trades.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No completed trades yet. Waiting for agents to start trading...
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">Showing Last {trades.length} Trades</p>
            {trades.map((trade) => {
              const agent = Object.values(AGENTS).find((a) => a.id === trade.agent_id);
              const agentColor = agent?.color || "#666";
              const agentName = agent?.name || "Unknown";
              const pnlValue = trade.pnl_usd || 0;
              const isPnlPositive = pnlValue >= 0;

              return (
                <div
                  key={trade.id}
                  className="border-2 border-border bg-card p-3 space-y-2 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-1 h-full border-2 border-border mt-1"
                      style={{ backgroundColor: agentColor }}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">
                          {agentName}
                        </span>
                        <span className="text-xs text-muted-foreground">completed a</span>
                        <Badge
                          variant={trade.side === "buy" ? "success" : "destructive"}
                          className="text-xs"
                        >
                          {trade.side}
                        </Badge>
                        <span className="text-xs text-muted-foreground">trade on</span>
                        <span className="text-xs font-bold text-foreground">
                          ${trade.token_symbol || 'UNKNOWN'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div>
                          <span className="text-muted-foreground">Entry: </span>
                          <span className="text-foreground">
                            ${trade.price_usd.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Exit: </span>
                          <span className="text-foreground">
                            ${trade.price_at_exit?.toFixed(4) || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount SOL: </span>
                          <span className="text-foreground">
                            {trade.volume_sol.toFixed(2)} SOL
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Holding time: </span>
                          <span className="text-foreground">
                            {formatHoldingTime(trade.holding_time_minutes)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">NET P&L: </span>
                        <span
                          className={`font-bold ${
                            isPnlPositive ? "text-accent-foreground" : "text-destructive"
                          }`}
                        >
                          {isPnlPositive ? '+' : ''}${pnlValue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {trade.exit_timestamp && formatTimestamp(trade.exit_timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
