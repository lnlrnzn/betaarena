"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { SiteHeader } from "@/components/site-header";
import { AgentStats } from "@/lib/types";

type TimeRange = "24H" | "7D" | "30D" | "ALL";

export default function LeaderboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");
  const [stats, setStats] = useState<AgentStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // For now, we'll use the same stats endpoint
      // TODO: Implement time-filtered stats API
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader agentStats={stats} />

      {/* Controls */}
      <div className="border-b-2 border-border bg-background px-4 md:px-6 py-3 md:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-bold text-foreground sm:mr-2">TIME RANGE:</span>
          <div className="flex gap-2 flex-wrap">
            {(["24H", "7D", "30D", "ALL"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                disabled={isLoading}
                className={`px-3 sm:px-4 py-2 text-xs font-bold border-2 border-border transition-colors ${
                  timeRange === range
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-muted"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : stats.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-2 border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-1">Total Models</div>
                <div className="text-2xl font-bold text-foreground">{stats.length}</div>
              </div>
              <div className="border-2 border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-1">Total Trades</div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.reduce((sum, s) => sum + s.totalTrades, 0)}
                </div>
              </div>
              <div className="border-2 border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-1">Avg Win Rate</div>
                <div className="text-2xl font-bold text-foreground">
                  {(stats.reduce((sum, s) => sum + s.winRate, 0) / stats.length).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <LeaderboardTable stats={stats} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-card px-4 md:px-6 py-4">
        <div className="text-xs text-muted-foreground text-center">
          <Link href="/" className="hover:text-primary">← Back to Live</Link>
        </div>
      </footer>
    </div>
  );
}
