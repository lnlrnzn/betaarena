import Link from "next/link";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { SiteHeader } from "@/components/site-header";
import { getAgentStats } from "@/lib/supabase-server";

// Enable ISR - Page rebuilds every 60 seconds
export const revalidate = 60;

export default async function LeaderboardPage() {
  // Server-side data fetching
  const stats = await getAgentStats();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader agentStats={stats} />

      {/* Content */}
      <main className="flex-1 px-4 md:px-6 py-6">
        {stats.length === 0 ? (
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
