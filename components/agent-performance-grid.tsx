"use client";

import { useMemo } from "react";
import { AGENTS } from "@/lib/constants";
import { AgentStats } from "@/lib/types";
import { AgentAvatar } from "./agent-avatar";

interface AgentPerformanceGridProps {
  stats: AgentStats[];
}

export function AgentPerformanceGrid({ stats }: AgentPerformanceGridProps) {
  // Sort by current value descending - memoized for performance
  const sortedStats = useMemo(
    () => [...stats].sort((a, b) => b.currentValue - a.currentValue),
    [stats]
  );

  const highest = sortedStats[0];
  const lowest = sortedStats[sortedStats.length - 1];

  const getAgentConfig = (agentId: string) => {
    const agent = Object.values(AGENTS).find((a) => a.id === agentId);
    return agent || Object.values(AGENTS)[0]; // Fallback to first agent (should never happen)
  };

  return (
    <div className="bg-background border-t-2 border-border">
      {/* Summary Bar */}
      <div className="border-b-2 border-border px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {highest && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">HIGHEST:</span>
            <div
              className="w-3 h-3 border-2 border-border flex-shrink-0"
              style={{ backgroundColor: getAgentConfig(highest.agent_id).color }}
            />
            <span className="text-sm font-bold text-foreground">
              {getAgentConfig(highest.agent_id).shortName}
            </span>
            <span className="text-sm font-bold text-foreground">
              ${highest.currentValue.toLocaleString()}
            </span>
            <span
              className={`text-sm font-bold ${
                highest.changePercent >= 0 ? "text-accent-foreground" : "text-destructive"
              }`}
            >
              {highest.changePercent >= 0 ? "+" : ""}
              {highest.changePercent.toFixed(2)}%
            </span>
          </div>
        )}
        {lowest && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">LOWEST:</span>
            <div
              className="w-3 h-3 border-2 border-border flex-shrink-0"
              style={{ backgroundColor: getAgentConfig(lowest.agent_id).color }}
            />
            <span className="text-sm font-bold text-foreground">
              {getAgentConfig(lowest.agent_id).shortName}
            </span>
            <span className="text-sm font-bold text-foreground">
              ${lowest.currentValue.toLocaleString()}
            </span>
            <span
              className={`text-sm font-bold ${
                lowest.changePercent >= 0 ? "text-accent-foreground" : "text-destructive"
              }`}
            >
              {lowest.changePercent >= 0 ? "+" : ""}
              {lowest.changePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x-2 divide-border">
        {sortedStats.map((stat, index) => {
          const agent = getAgentConfig(stat.agent_id);
          return (
            <div
              key={stat.agent_id}
              className={`p-4 hover:bg-muted transition-colors border-b-2 md:border-b-0 border-border ${
                stat.is_eliminated ? 'opacity-60 grayscale' : ''
              }`}
            >
              <div className="space-y-2">
                {/* Agent Header */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-8 border-2 border-border flex-shrink-0"
                    style={{ backgroundColor: agent.color }}
                  />
                  <AgentAvatar
                    logo={agent.logo}
                    logoFallback={agent.logoFallback}
                    name={agent.name}
                    color={agent.color}
                    size={32}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-foreground truncate">
                      {agent.shortName.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Portfolio Value */}
                <div>
                  <div className="text-lg font-bold text-foreground">
                    ${(stat.currentValue / 1000).toFixed(1)}k
                  </div>
                  <div
                    className={`text-xs font-bold ${
                      stat.change >= 0 ? "text-accent-foreground" : "text-destructive"
                    }`}
                  >
                    {stat.change >= 0 ? "+" : ""}
                    {stat.changePercent.toFixed(2)}%
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>{stat.totalTrades} trades</div>
                  <div>{stat.winRate.toFixed(0)}% win rate</div>
                </div>

                {/* Rank Badge or Elimination Status */}
                {stat.is_eliminated && stat.elimination_order ? (
                  <div className="inline-flex items-center justify-center px-2 py-1 bg-red-500 text-white border-2 border-red-600 text-xs font-bold">
                    ELIMINATED
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center px-2 py-1 bg-primary text-primary-foreground border-2 border-border text-xs font-bold">
                    #{index + 1}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
