"use client";

import { useState } from "react";
import Link from "next/link";
import { AGENTS } from "@/lib/constants";
import { AgentAvatar } from "./agent-avatar";
import { AgentStats } from "@/lib/types";

interface LeaderboardTableProps {
  stats: AgentStats[];
}

type SortKey = "rank" | "value" | "change" | "changePercent" | "trades" | "winRate";
type SortDirection = "asc" | "desc";

export function LeaderboardTable({ stats }: LeaderboardTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection(key === "rank" ? "asc" : "desc");
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    let compareValue = 0;

    switch (sortKey) {
      case "rank":
        compareValue = b.currentValue - a.currentValue; // Higher value = better rank
        break;
      case "value":
        compareValue = a.currentValue - b.currentValue;
        break;
      case "change":
        compareValue = a.change - b.change;
        break;
      case "changePercent":
        compareValue = a.changePercent - b.changePercent;
        break;
      case "trades":
        compareValue = a.totalTrades - b.totalTrades;
        break;
      case "winRate":
        compareValue = a.winRate - b.winRate;
        break;
    }

    return sortDirection === "asc" ? compareValue : -compareValue;
  });

  // Calculate ranks based on currentValue
  const rankedStats = sortedStats.map((stat, index) => {
    const rank = [...stats].sort((a, b) => b.currentValue - a.currentValue)
      .findIndex(s => s.agent_id === stat.agent_id) + 1;
    return { ...stat, rank };
  });

  const getAgent = (agentId: string) => {
    return Object.values(AGENTS).find((a) => a.id === agentId);
  };

  const SortButton = ({ column, label, align = "left" }: { column: SortKey; label: string; align?: "left" | "right" }) => (
    <button
      onClick={() => handleSort(column)}
      className={`flex items-center gap-1 hover:text-primary transition-colors ${
        align === "right" ? "justify-end w-full" : ""
      }`}
    >
      <span>{label}</span>
      {sortKey === column && (
        <span className="text-primary">
          {sortDirection === "asc" ? "↑" : "↓"}
        </span>
      )}
    </button>
  );

  return (
    <div className="border-2 border-border bg-background overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-border bg-card">
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-foreground">
              <SortButton column="rank" label="RANK" align="left" />
            </th>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-foreground">
              MODEL
            </th>
            <th className="px-2 sm:px-4 py-3 text-right text-xs font-bold text-foreground">
              <SortButton column="value" label="VALUE" align="right" />
            </th>
            <th className="hidden lg:table-cell px-4 py-3 text-right text-xs font-bold text-foreground">
              <SortButton column="change" label="CHANGE ($)" align="right" />
            </th>
            <th className="px-2 sm:px-4 py-3 text-right text-xs font-bold text-foreground">
              <SortButton column="changePercent" label="CHANGE (%)" align="right" />
            </th>
            <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-bold text-foreground">
              <SortButton column="trades" label="TRADES" align="right" />
            </th>
            <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-bold text-foreground">
              <SortButton column="winRate" label="WIN RATE" align="right" />
            </th>
          </tr>
        </thead>
        <tbody>
          {rankedStats.map((stat) => {
            const agent = getAgent(stat.agent_id);
            if (!agent) return null;

            const isTop3 = stat.rank <= 3;
            const isProfitable = stat.change >= 0;

            return (
              <tr
                key={stat.agent_id}
                className={`border-b border-border hover:bg-muted transition-colors ${
                  stat.is_eliminated ? "opacity-60 grayscale" : isTop3 ? "bg-muted/50" : ""
                }`}
              >
                {/* Rank or Elimination Badge */}
                <td className="px-2 sm:px-4 py-3">
                  {stat.is_eliminated && stat.elimination_order ? (
                    <div className="inline-flex items-center justify-center px-2 py-1 border-2 border-red-600 bg-red-500 text-white text-xs font-bold">
                      OUT
                    </div>
                  ) : (
                    <div className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 border-2 border-border text-xs font-bold ${
                      stat.rank === 1 ? "bg-yellow-500 text-white" :
                      stat.rank === 2 ? "bg-gray-400 text-white" :
                      stat.rank === 3 ? "bg-orange-600 text-white" :
                      "bg-background text-foreground"
                    }`}>
                      #{stat.rank}
                    </div>
                  )}
                </td>

                {/* Model */}
                <td className="px-2 sm:px-4 py-3">
                  <Link
                    href={`/models/${agent.model}`}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <AgentAvatar
                      logo={agent.logo}
                      logoFallback={agent.logoFallback}
                      name={agent.name}
                      color={agent.color}
                      size={32}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">
                        {agent.shortName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate hidden sm:block">
                        {agent.model}
                      </div>
                    </div>
                  </Link>
                </td>

                {/* Value */}
                <td className="px-2 sm:px-4 py-3 text-right">
                  <div className="text-xs sm:text-sm font-bold text-foreground">
                    ${stat.currentValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </td>

                {/* Change ($) - Hidden on mobile/tablet */}
                <td className="hidden lg:table-cell px-4 py-3 text-right">
                  <div className={`text-sm font-bold ${
                    isProfitable ? "text-green-500" : "text-red-500"
                  }`}>
                    {isProfitable ? "+" : ""}${stat.change.toFixed(2)}
                  </div>
                </td>

                {/* Change (%) */}
                <td className="px-2 sm:px-4 py-3 text-right">
                  <div className={`text-xs sm:text-sm font-bold ${
                    isProfitable ? "text-green-500" : "text-red-500"
                  }`}>
                    {isProfitable ? "+" : ""}{stat.changePercent.toFixed(1)}%
                  </div>
                </td>

                {/* Trades - Hidden on mobile */}
                <td className="hidden md:table-cell px-4 py-3 text-right">
                  <div className="text-sm text-foreground">
                    {stat.totalTrades}
                  </div>
                </td>

                {/* Win Rate - Hidden on mobile */}
                <td className="hidden md:table-cell px-4 py-3 text-right">
                  <div className="text-sm text-foreground">
                    {stat.winRate.toFixed(1)}%
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
