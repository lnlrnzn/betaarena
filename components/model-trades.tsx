"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface Trade {
  id: string;
  agent_id: string;
  token_address: string;
  token_name: string;
  token_symbol: string;
  token_image_url: string | null;
  side: string;
  token_amount: string;
  price_usd: string;
  price_at_exit: string | null;
  volume_usd: string;
  volume_sol: string;
  timestamp: string;
  exit_timestamp: string | null;
  pnl_sol: string | null;
  pnl_usd: string | null;
  pnl_percentage: string | null;
  holding_time_minutes: number | null;
  status: string;
}

interface ModelTradesProps {
  trades: Trade[];
  agentId: string;
}

export function ModelTrades({ trades: initialTrades, agentId }: ModelTradesProps) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);

  // Real-time subscription for new/updated trades
  useEffect(() => {
    const channel = supabase
      .channel(`trades-${agentId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'trades',
          filter: `agent_id=eq.${agentId}`,
        },
        (payload) => {
          console.log('Trade update received:', payload);

          if (payload.eventType === 'INSERT') {
            const newTrade = payload.new as Trade;
            setTrades((prev) => [newTrade, ...prev].slice(0, 100)); // Keep latest 100
          } else if (payload.eventType === 'UPDATE') {
            const updatedTrade = payload.new as Trade;
            setTrades((prev) =>
              prev.map((trade) => (trade.id === updatedTrade.id ? updatedTrade : trade))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedTrade = payload.old as Trade;
            setTrades((prev) => prev.filter((trade) => trade.id !== deletedTrade.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId]);

  if (trades.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">No trades yet</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-border bg-background overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-border bg-card">
            <th className="px-4 py-3 text-left text-xs font-bold text-foreground">Token</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-foreground">Side</th>
            <th className="px-4 py-3 text-right text-xs font-bold text-foreground">Entry Price</th>
            <th className="px-4 py-3 text-right text-xs font-bold text-foreground">Exit Price</th>
            <th className="px-4 py-3 text-right text-xs font-bold text-foreground">Volume (SOL)</th>
            <th className="px-4 py-3 text-right text-xs font-bold text-foreground">P&L</th>
            <th className="px-4 py-3 text-right text-xs font-bold text-foreground">Hold Time</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-foreground">Status</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-foreground">Date</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const pnl = trade.pnl_usd ? parseFloat(trade.pnl_usd) : 0;
            const isProfitable = pnl >= 0;
            const isOpen = trade.status === 'open';

            return (
              <tr key={trade.id} className="border-b border-border hover:bg-muted transition-colors">
                {/* Token */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {trade.token_image_url ? (
                      <Image
                        src={trade.token_image_url}
                        alt={trade.token_symbol}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                        {trade.token_symbol?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-foreground">{trade.token_symbol}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[100px]">
                        {trade.token_name}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Side */}
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-bold border-2 border-border ${
                    trade.side === 'buy' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {trade.side.toUpperCase()}
                  </span>
                </td>

                {/* Entry Price */}
                <td className="px-4 py-3 text-right">
                  <div className="text-sm text-foreground">
                    ${parseFloat(trade.price_usd).toFixed(6)}
                  </div>
                </td>

                {/* Exit Price */}
                <td className="px-4 py-3 text-right">
                  {trade.price_at_exit ? (
                    <div className="text-sm text-foreground">
                      ${parseFloat(trade.price_at_exit).toFixed(6)}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </td>

                {/* Volume (SOL) */}
                <td className="px-4 py-3 text-right">
                  <div className="text-sm text-foreground">
                    {parseFloat(trade.volume_sol).toFixed(4)} SOL
                  </div>
                </td>

                {/* P&L */}
                <td className="px-4 py-3 text-right">
                  {trade.pnl_usd ? (
                    <div>
                      <div className={`text-sm font-bold ${
                        isProfitable ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {isProfitable ? '+' : ''}${pnl.toFixed(2)}
                      </div>
                      {trade.pnl_percentage && (
                        <div className={`text-xs ${
                          isProfitable ? 'text-green-500' : 'text-red-500'
                        }`}>
                          ({isProfitable ? '+' : ''}{parseFloat(trade.pnl_percentage).toFixed(2)}%)
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </td>

                {/* Hold Time */}
                <td className="px-4 py-3 text-right">
                  {trade.holding_time_minutes ? (
                    <div className="text-sm text-foreground">
                      {Math.floor(trade.holding_time_minutes / 60)}h {trade.holding_time_minutes % 60}m
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold ${
                    isOpen ? 'text-blue-500' : 'text-muted-foreground'
                  }`}>
                    {trade.status.toUpperCase()}
                  </span>
                </td>

                {/* Date */}
                <td className="px-4 py-3">
                  <div className="text-xs text-foreground">
                    {new Date(trade.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
