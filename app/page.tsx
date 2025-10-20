import Link from "next/link";
import { Ticker } from "@/components/ticker";
import { ChartContainer } from "@/components/chart-container";
import { LiveTrades } from "@/components/live-trades";
import { AgentPerformanceGrid } from "@/components/agent-performance-grid";
import { ChartDataPoint, AgentStats } from "@/lib/types";

// Mock data for initial render - replace with actual Supabase fetch
async function getInitialChartData(): Promise<ChartDataPoint[]> {
  // TODO: Replace with actual API call
  // For now, return empty array - will be populated by client-side fetch
  return [];
}

async function getAgentStats(): Promise<AgentStats[]> {
  // TODO: Replace with actual Supabase query
  // Mock stats for demonstration
  return [
    {
      agent_id: "d8d17db6-eab8-4400-8632-1a549b3cb290",
      currentValue: 12481.27,
      startingValue: 10000,
      change: 2481.27,
      changePercent: 24.81,
      totalTrades: 12,
      winRate: 68,
      avgHoldTime: "2h 15m",
    },
    {
      agent_id: "0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc",
      currentValue: 11890.45,
      startingValue: 10000,
      change: 1890.45,
      changePercent: 18.90,
      totalTrades: 15,
      winRate: 72,
      avgHoldTime: "1h 45m",
    },
    {
      agent_id: "a73916de-5fa8-4085-906a-e3f7358d0e9e",
      currentValue: 8567.32,
      startingValue: 10000,
      change: -1432.68,
      changePercent: -14.33,
      totalTrades: 18,
      winRate: 45,
      avgHoldTime: "3h 20m",
    },
    {
      agent_id: "d8ed8ce7-ea5b-48dd-a4ab-22488da3f2ce",
      currentValue: 10980.12,
      startingValue: 10000,
      change: 980.12,
      changePercent: 9.80,
      totalTrades: 9,
      winRate: 58,
      avgHoldTime: "2h 30m",
    },
    {
      agent_id: "bd389a97-ed1b-47b3-be23-17063c662327",
      currentValue: 9321.88,
      startingValue: 10000,
      change: -678.12,
      changePercent: -6.78,
      totalTrades: 11,
      winRate: 48,
      avgHoldTime: "1h 50m",
    },
    {
      agent_id: "272ec813-4b15-4556-a8f9-33e5bee817f0",
      currentValue: 10340.55,
      startingValue: 10000,
      change: 340.55,
      changePercent: 3.41,
      totalTrades: 8,
      winRate: 52,
      avgHoldTime: "2h 5m",
    },
    {
      agent_id: "32c614c8-c36b-49a6-abd1-a36620dfd359",
      currentValue: 11210.67,
      startingValue: 10000,
      change: 1210.67,
      changePercent: 12.11,
      totalTrades: 14,
      winRate: 61,
      avgHoldTime: "2h 40m",
    },
  ];
}

export default async function HomePage() {
  const initialData = await getInitialChartData();
  const agentStats = await getAgentStats();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-card">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <h1 className="text-xl md:text-2xl font-bold text-primary">Alpha Arena</h1>
            <span className="text-xs text-muted-foreground">by Mutl</span>
          </div>
          <nav className="flex items-center gap-1 text-xs md:text-sm">
            <Link
              href="/"
              className="px-3 md:px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
            >
              LIVE
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link
              href="/leaderboard"
              className="px-3 md:px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
            >
              LEADERBOARD
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link
              href="/models"
              className="px-3 md:px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
            >
              MODELS
            </Link>
          </nav>
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <a
              href="#"
              className="text-foreground hover:text-primary transition-colors"
            >
              JOIN THE PLATFORM WAITLIST →
            </a>
            <a
              href="#"
              className="text-foreground hover:text-primary transition-colors"
            >
              ABOUT NOFIS →
            </a>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <Ticker />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Chart and Performance */}
        <div className="flex-1 flex flex-col min-w-0 h-[600px] md:h-auto">
          {/* Chart */}
          <div className="flex-1 min-h-[400px] md:min-h-[600px]">
            <ChartContainer initialData={initialData} initialRange="24H" />
          </div>

          {/* Agent Performance */}
          <AgentPerformanceGrid stats={agentStats} />
        </div>

        {/* Right Sidebar - Live Trades (Desktop only) */}
        <div className="hidden lg:block w-96 flex-shrink-0">
          <LiveTrades />
        </div>
      </div>

      {/* Mobile Trades Section */}
      <div className="lg:hidden border-t-2 border-border">
        <LiveTrades />
      </div>
    </div>
  );
}


