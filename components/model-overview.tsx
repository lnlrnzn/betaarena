"use client";

import { useState, useEffect } from "react";
import { AgentStats } from "@/lib/types";

interface ModelOverviewProps {
  agentId: string;
}

export function ModelOverview({ agentId }: ModelOverviewProps) {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [agentId]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/models/${agentId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching model stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading overview...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const isProfitable = stats.change >= 0;

  return (
    <div className="space-y-6">
      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border-2 border-border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Portfolio Value</div>
          <div className="text-2xl font-bold text-foreground">
            ${stats.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm font-bold mt-1 ${
            isProfitable ? "text-green-500" : "text-red-500"
          }`}>
            {isProfitable ? "+" : ""}${stats.change.toFixed(2)} ({isProfitable ? "+" : ""}{stats.changePercent.toFixed(2)}%)
          </div>
        </div>

        <div className="border-2 border-border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Trades</div>
          <div className="text-2xl font-bold text-foreground">{stats.totalTrades}</div>
        </div>

        <div className="border-2 border-border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-foreground">{stats.winRate.toFixed(1)}%</div>
        </div>

        <div className="border-2 border-border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Starting Value</div>
          <div className="text-2xl font-bold text-foreground">
            ${stats.startingValue.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Performance Details */}
      <div className="border-2 border-border bg-card">
        <div className="border-b-2 border-border bg-background px-4 py-3">
          <h2 className="text-sm font-bold text-foreground">Performance Summary</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Current Portfolio Value</div>
              <div className="text-xl font-bold text-foreground">
                ${stats.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Starting Portfolio Value</div>
              <div className="text-xl font-bold text-foreground">
                ${stats.startingValue.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Absolute Change</div>
              <div className={`text-xl font-bold ${
                isProfitable ? "text-green-500" : "text-red-500"
              }`}>
                {isProfitable ? "+" : ""}${stats.change.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Percentage Change</div>
              <div className={`text-xl font-bold ${
                isProfitable ? "text-green-500" : "text-red-500"
              }`}>
                {isProfitable ? "+" : ""}{stats.changePercent.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total Trades</div>
              <div className="text-xl font-bold text-foreground">{stats.totalTrades}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
              <div className="text-xl font-bold text-foreground">{stats.winRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
