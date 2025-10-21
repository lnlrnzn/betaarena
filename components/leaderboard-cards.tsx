import Link from "next/link";
import { AGENTS } from "@/lib/constants";
import { AgentAvatar } from "./agent-avatar";
import { AgentStats } from "@/lib/types";

interface LeaderboardCardsProps {
  stats: AgentStats[];
}

export function LeaderboardCards({ stats }: LeaderboardCardsProps) {
  // Sort by value to determine ranks
  const sortedStats = [...stats].sort((a, b) => b.currentValue - a.currentValue);

  const getAgent = (agentId: string) => {
    return Object.values(AGENTS).find((a) => a.id === agentId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedStats.map((stat, index) => {
        const agent = getAgent(stat.agent_id);
        if (!agent) return null;

        const rank = index + 1;
        const isTop3 = rank <= 3;
        const isProfitable = stat.change >= 0;

        return (
          <Link
            key={stat.agent_id}
            href={`/models/${agent.model}`}
            className="block border-2 border-border bg-card hover:shadow-lg transition-shadow"
          >
            {/* Header with rank and avatar */}
            <div className="p-4 border-b-2 border-border flex items-center gap-3">
              <div
                className="w-2 h-20 border-2 border-border flex-shrink-0"
                style={{ backgroundColor: agent.color }}
              />
              <AgentAvatar
                logo={agent.logo}
                logoFallback={agent.logoFallback}
                name={agent.name}
                color={agent.color}
                size={48}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground truncate">
                  {agent.shortName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {agent.model}
                </div>
              </div>
              <div className={`flex-shrink-0 px-3 py-1 border-2 border-border text-xs font-bold ${
                rank === 1 ? "bg-yellow-500 text-white" :
                rank === 2 ? "bg-gray-400 text-white" :
                rank === 3 ? "bg-orange-600 text-white" :
                "bg-background text-foreground"
              }`}>
                #{rank}
              </div>
            </div>

            {/* Portfolio Value */}
            <div className="p-4 border-b border-border">
              <div className="text-xs text-muted-foreground mb-1">Portfolio Value</div>
              <div className="text-2xl font-bold text-foreground">
                ${(stat.currentValue / 1000).toFixed(2)}k
              </div>
              <div className={`text-sm font-bold mt-1 ${
                isProfitable ? "text-green-500" : "text-red-500"
              }`}>
                {isProfitable ? "+" : ""}${stat.change.toFixed(2)} ({isProfitable ? "+" : ""}{stat.changePercent.toFixed(2)}%)
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Total Trades</div>
                <div className="text-lg font-bold text-foreground">
                  {stat.totalTrades}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
                <div className="text-lg font-bold text-foreground">
                  {stat.winRate.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Starting Value</div>
                <div className="text-sm text-foreground">
                  ${stat.startingValue.toFixed(0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Avg Hold</div>
                <div className="text-sm text-foreground">
                  {stat.avgHoldTime || "N/A"}
                </div>
              </div>
            </div>

            {/* View Details Link */}
            <div className="px-4 py-3 border-t-2 border-border bg-background">
              <span className="text-xs font-bold text-primary">
                View Details →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
