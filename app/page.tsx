import { Ticker } from "@/components/ticker";
import { ChartContainer } from "@/components/chart-container";
import { SidebarTabs } from "@/components/sidebar-tabs";
import { AgentPerformanceGrid } from "@/components/agent-performance-grid";
import { SiteHeader } from "@/components/site-header";
import { ChartDataPoint } from "@/lib/types";
import { getAgentStats, getLatestTrades, getLatestActivities, supabaseServer } from "@/lib/supabase-server";
import { SOL_BASELINE, TIME_RANGES } from "@/lib/constants";

// Initial chart data - fetch server-side for faster initial render
async function getInitialChartData(): Promise<ChartDataPoint[]> {
  try {
    const range = "24H";
    const timeRange = TIME_RANGES[range];

    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - timeRange.hours);

    // Fetch portfolio snapshots for all agents
    const { data: snapshots } = await supabaseServer
      .from("portfolio_snapshots")
      .select("agent_id, timestamp, total_portfolio_value_usd")
      .gte("timestamp", hoursAgo.toISOString())
      .order("timestamp", { ascending: true });

    // Fetch SOL price history
    const { data: solPrices } = await supabaseServer
      .from("sol_price_history")
      .select("timestamp, price_usd")
      .gte("timestamp", hoursAgo.toISOString())
      .order("timestamp", { ascending: true });

    if (!snapshots || snapshots.length === 0) {
      return [];
    }

    // Aggregate data
    const startingSolBalance = 1.0;
    const aggregationMinutes = timeRange.aggregation;
    const buckets = new Map<number, Map<string, number>>();

    // Process snapshots
    snapshots.forEach((snapshot) => {
      const timestamp = new Date(snapshot.timestamp).getTime();
      const bucketTime = Math.floor(timestamp / (aggregationMinutes * 60 * 1000)) * (aggregationMinutes * 60 * 1000);

      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, new Map());
      }

      const bucket = buckets.get(bucketTime)!;
      bucket.set(snapshot.agent_id, snapshot.total_portfolio_value_usd);
    });

    // Process SOL prices for baseline
    const solPriceMap = new Map<number, number>();
    if (solPrices) {
      solPrices.forEach((price) => {
        const timestamp = new Date(price.timestamp).getTime();
        const bucketTime = Math.floor(timestamp / (aggregationMinutes * 60 * 1000)) * (aggregationMinutes * 60 * 1000);
        solPriceMap.set(bucketTime, price.price_usd);
      });
    }

    // Convert to chart data points
    const dataPoints: ChartDataPoint[] = [];

    buckets.forEach((agentValues, bucketTime) => {
      const point: ChartDataPoint = {
        timestamp: bucketTime,
        date: new Date(bucketTime).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Add agent values
      agentValues.forEach((value, agentId) => {
        point[agentId] = value;
      });

      // Add SOL baseline
      const solPrice = solPriceMap.get(bucketTime);
      if (solPrice) {
        point[SOL_BASELINE.id] = startingSolBalance * solPrice;
      }

      dataPoints.push(point);
    });

    return dataPoints.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error("Error fetching initial chart data:", error);
    return [];
  }
}

export default async function HomePage() {
  const initialData = await getInitialChartData();
  const agentStats = await getAgentStats();
  const latestTrades = await getLatestTrades(20);
  const latestActivities = await getLatestActivities(50);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader agentStats={agentStats} />

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

        {/* Right Sidebar - Tabbed Info (Desktop only) */}
        <div className="hidden lg:block w-96 flex-shrink-0">
          <SidebarTabs trades={latestTrades} activities={latestActivities} />
        </div>
      </div>

      {/* Mobile Sidebar Section */}
      <div className="lg:hidden border-t-2 border-border">
        <SidebarTabs trades={latestTrades} activities={latestActivities} />
      </div>
    </div>
  );
}


