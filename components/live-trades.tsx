"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AGENTS } from "@/lib/constants";
import { useRealtime } from "./providers/realtime-provider";

interface TradeData {
  id: string;
  agent_id: string;
  token_address: string;
  token_symbol: string | null;
  side: string;
  price_usd: number | null;
  price_at_exit: number | null;
  volume_sol: number | null;
  token_amount: number | null;
  volume_usd: number | null;
  timestamp: string;
  exit_timestamp: string | null;
  pnl_usd: number | null;
  holding_time_minutes: number | null;
  status: string;
  enriched: boolean;
  signature: string | null;
}

interface LiveTradesProps {
  trades: TradeData[];
  agentFilter: string;
}

// Helper function to deduplicate trades by ID
function deduplicateTrades(trades: TradeData[]): TradeData[] {
  const seen = new Set<string>();
  return trades.filter(trade => {
    if (seen.has(trade.id)) {
      return false;
    }
    seen.add(trade.id);
    return true;
  });
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

// Abbreviate contract address for display (e.g., "WXsX5H...cXAU")
function abbreviateAddress(address: string) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function LiveTrades({ trades: initialTrades, agentFilter }: LiveTradesProps) {
  const [trades, setTrades] = useState<TradeData[]>(deduplicateTrades(initialTrades));
  const { latestTrade } = useRealtime();

  // Real-time update from global context
  useEffect(() => {
    if (!latestTrade) return;

    console.log('New trade received:', latestTrade);
    setTrades((prev) => {
      // Check if trade already exists to prevent duplicates
      if (prev.some(trade => trade.id === latestTrade.id)) {
        // Trade exists - update it (for status changes from open → closed)
        return prev.map(trade =>
          trade.id === latestTrade.id ? latestTrade : trade
        );
      }
      // New trade - add to beginning
      return [latestTrade, ...prev].slice(0, 100); // Keep latest 100
    });
  }, [latestTrade]);

  // Filter trades by agent
  const filteredTrades = agentFilter === "all"
    ? trades
    : trades.filter(trade => trade.agent_id === agentFilter);

  return (
    <div className="h-full bg-background overflow-y-auto">
      <div className="sticky top-0 bg-background border-b-2 border-border px-4 py-3 z-10">
        <h2 className="text-sm font-bold text-foreground">LIVE TRADES</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {agentFilter === "all"
            ? "All buy/sell transactions from agents"
            : `Trades from ${Object.values(AGENTS).find(a => a.id === agentFilter)?.shortName}`
          }
        </p>
      </div>

      <div className="p-4 space-y-3">
        {filteredTrades.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            {agentFilter === "all"
              ? "No trades yet. Waiting for agents to start trading..."
              : "No trades for this agent yet."}
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Showing {filteredTrades.length} {filteredTrades.length === 1 ? 'trade' : 'trades'}
            </p>
            {filteredTrades.map((trade) => {
              const agent = Object.values(AGENTS).find((a) => a.id === trade.agent_id);
              const agentColor = agent?.color || "#666";
              const agentName = agent?.name || "Unknown";
              const pnlValue = trade.pnl_usd || 0;
              const isPnlPositive = pnlValue >= 0;
              const isClosed = trade.status === 'closed';
              const isOpen = trade.status === 'open';
              const isEnriching = !trade.enriched;

              return (
                <div
                  key={trade.id}
                  className="border-2 border-border bg-card p-3 space-y-2 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-1 h-full border-2 border-border mt-1 flex-shrink-0"
                      style={{ backgroundColor: agentColor }}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground truncate max-w-[100px]">
                          {agentName}
                        </span>
                        <Badge
                          variant={trade.side === "buy" ? "success" : "destructive"}
                          className="text-xs flex-shrink-0"
                        >
                          {trade.side.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-bold text-foreground truncate max-w-[120px]" title={trade.token_address}>
                          {isEnriching ? abbreviateAddress(trade.token_address) : `$${trade.token_symbol || 'UNKNOWN'}`}
                        </span>
                        {isEnriching ? (
                          <Badge
                            variant="outline"
                            className="text-xs flex-shrink-0 bg-yellow-500/10 text-yellow-600 border-yellow-600"
                          >
                            ENRICHING...
                          </Badge>
                        ) : (
                          <Badge
                            variant={isClosed ? "default" : "outline"}
                            className="text-xs flex-shrink-0"
                          >
                            {trade.status.toUpperCase()}
                          </Badge>
                        )}
                        {trade.signature && (
                          <a
                            href={`https://solscan.io/tx/${trade.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            title="View transaction on Solscan"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Solscan
                          </a>
                        )}
                      </div>
                      {isEnriching ? (
                        <div className="text-xs text-muted-foreground italic">
                          Processing on-chain data...
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div>
                              <span className="text-muted-foreground">{trade.side === 'buy' ? 'Entry' : 'Exit'} Price: </span>
                              <span className="text-foreground">
                                ${trade.price_usd?.toFixed(4) || 'N/A'}
                              </span>
                            </div>
                            {isClosed && trade.price_at_exit && (
                              <div>
                                <span className="text-muted-foreground">{trade.side === 'buy' ? 'Exit' : 'Entry'} Price: </span>
                                <span className="text-foreground">
                                  ${trade.price_at_exit.toFixed(4)}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Amount SOL: </span>
                              <span className="text-foreground">
                                {trade.volume_sol?.toFixed(2) || 'N/A'} SOL
                              </span>
                            </div>
                            {isClosed && trade.holding_time_minutes !== null && (
                              <div>
                                <span className="text-muted-foreground">Holding time: </span>
                                <span className="text-foreground">
                                  {formatHoldingTime(trade.holding_time_minutes)}
                                </span>
                              </div>
                            )}
                          </div>
                          {isClosed && trade.pnl_usd !== null && (
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
                          )}
                          {isOpen && !isEnriching && (
                            <div className="text-xs text-muted-foreground italic">
                              Position currently open...
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {isClosed && trade.exit_timestamp
                        ? formatTimestamp(trade.exit_timestamp)
                        : formatTimestamp(trade.timestamp)}
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
