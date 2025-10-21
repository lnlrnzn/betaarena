"use client";

import { useState, useEffect } from "react";
import { AGENTS } from "@/lib/constants";

interface PositionData {
  agent_id: string;
  token_address: string;
  token_name: string;
  token_symbol: string;
  token_image_url: string;
  token_amount: number;
  value_in_usd: number;
  current_price_sol: number;
  unrealized_pnl_sol: number | null;
  unrealized_pnl_percentage: number | null;
}

export function Positions() {
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/positions');
      const data = await response.json();
      setPositions(data);
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPositions = selectedAgent === "all"
    ? positions
    : positions.filter(p => p.agent_id === selectedAgent);

  const agentOptions = [
    { id: "all", name: "ALL AGENTS" },
    ...Object.values(AGENTS).map(a => ({ id: a.id, name: a.shortName }))
  ];

  return (
    <div className="h-full bg-background overflow-y-auto">
      <div className="sticky top-0 bg-background border-b-2 border-border px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">OPEN POSITIONS</h2>
          <button
            onClick={fetchPositions}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-primary text-primary-foreground border-2 border-border hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "..." : "REFRESH"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">FILTER:</span>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="text-xs bg-background text-foreground border-2 border-border px-2 py-1"
          >
            {agentOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name} ▼
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            Loading positions...
          </p>
        ) : filteredPositions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No open positions. All agents are fully in SOL.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Showing {filteredPositions.length} Position{filteredPositions.length !== 1 ? 's' : ''}
            </p>
            {filteredPositions.map((position) => {
              const agent = Object.values(AGENTS).find((a) => a.id === position.agent_id);
              const agentColor = agent?.color || "#666";
              const agentName = agent?.shortName || "Unknown";
              const pnl = position.unrealized_pnl_percentage || 0;
              const isPnlPositive = pnl >= 0;

              return (
                <div
                  key={`${position.agent_id}-${position.token_address}`}
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
                        <span className="text-xs text-muted-foreground">holding</span>
                        <span className="text-xs font-bold text-foreground">
                          ${position.token_symbol}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div>
                          <span className="text-muted-foreground">Amount: </span>
                          <span className="text-foreground">
                            {position.token_amount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Value: </span>
                          <span className="text-foreground">
                            ${position.value_in_usd.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Price: </span>
                          <span className="text-foreground">
                            {position.current_price_sol.toFixed(6)} SOL
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">P&L: </span>
                          <span
                            className={`font-bold ${
                              isPnlPositive ? "text-accent-foreground" : "text-destructive"
                            }`}
                          >
                            {isPnlPositive ? '+' : ''}{pnl.toFixed(2)}%
                          </span>
                        </div>
                      </div>
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
