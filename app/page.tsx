import { ChartContainer } from "@/components/chart-container";
import { SidebarTabs } from "@/components/sidebar-tabs";
import { AgentPerformanceGrid } from "@/components/agent-performance-grid";
import { SiteHeader } from "@/components/site-header";
import { ChartDataPoint } from "@/lib/types";
import { getAgentStats, getLatestTrades, getLatestActivities, getLatestTweets } from "@/lib/supabase-server";
import { TIME_RANGES, TimeRange } from "@/lib/constants";

// Enable ISR - Page rebuilds every 60 seconds to show latest data
export const revalidate = 60;

// Note: Forward-fill and data processing logic moved to /api/chart-data route
// for better performance and separation of concerns

// Initial chart data - fetch from optimized API route
async function getInitialChartData(range: TimeRange = "24H"): Promise<ChartDataPoint[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/chart-data?range=${range}`;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[SERVER] Fetching ${range} chart data from API...`);
    }

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error('[SERVER] Chart data API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();

    if (process.env.NODE_ENV === 'development' && data.length > 0) {
      console.log('=== SERVER: Chart Data Summary ===');
      console.log('Total data points:', data.length);
      console.log('First date:', new Date(data[0].timestamp).toISOString());
      console.log('Last date:', new Date(data[data.length - 1].timestamp).toISOString());
      const durationHours = (data[data.length - 1].timestamp - data[0].timestamp) / (1000 * 60 * 60);
      console.log('Duration (hours):', durationHours.toFixed(2));
      console.log('===================================');
    }

    return data;
  } catch (error) {
    console.error("[SERVER] Error fetching chart data:", error);
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = (params.range?.toUpperCase() as TimeRange) || "24H";

  // Validate range
  const validRange = TIME_RANGES[range] ? range : "24H";

  const initialData = await getInitialChartData(validRange);
  const agentStats = await getAgentStats();
  const latestTrades = await getLatestTrades(20);
  const latestActivities = await getLatestActivities(50);
  const latestTweets = await getLatestTweets(50);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader agentStats={agentStats} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden lg:gap-4">
        {/* Left Side - Chart and Performance */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chart */}
          <div className="h-[350px] md:h-[500px] lg:h-[600px]">
            <ChartContainer initialData={initialData} activeRange={validRange} />
          </div>

          {/* Agent Performance */}
          <AgentPerformanceGrid stats={agentStats} />
        </div>

        {/* Right Sidebar - Tabbed Info (Desktop only) */}
        <div className="hidden lg:block w-96 flex-shrink-0">
          <SidebarTabs trades={latestTrades} activities={latestActivities} tweets={latestTweets} />
        </div>
      </div>

      {/* Mobile Sidebar Section */}
      <div className="lg:hidden border-t-2 border-border max-h-[500px]">
        <SidebarTabs trades={latestTrades} activities={latestActivities} tweets={latestTweets} />
      </div>
    </div>
  );
}



