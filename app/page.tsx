import { ChartContainer } from "@/components/chart-container";
import { SidebarTabs } from "@/components/sidebar-tabs";
import { AgentPerformanceGrid } from "@/components/agent-performance-grid";
import { SiteHeader } from "@/components/site-header";
import { ChartDataPoint } from "@/lib/types";
import { getAgentStats, getLatestTrades, getLatestDecisions, getLatestTweets, supabaseServer } from "@/lib/supabase-server";
import { TIME_RANGES, TimeRange } from "@/lib/constants";

// Enable ISR - Page rebuilds every 60 seconds to show latest data
export const revalidate = 60;

// Forward-fill utility to handle zero/missing values in time series data
function forwardFillTimeSeries<T extends Record<string, any>>(
  data: T[],
  timestampKey: keyof T,
  valueKey: keyof T
): { filled: T[]; zeroCount: number; filledCount: number } {
  if (!data || data.length === 0) {
    return { filled: [], zeroCount: 0, filledCount: 0 };
  }

  // Sort by timestamp to ensure proper forward-fill
  const sorted = [...data].sort((a, b) => {
    const timeA = new Date(a[timestampKey] as any).getTime();
    const timeB = new Date(b[timestampKey] as any).getTime();
    return timeA - timeB;
  });

  let zeroCount = 0;
  let filledCount = 0;
  let lastValidValue: number | null = null;

  // First pass: count zeros and forward-fill
  const result = sorted.map((item) => {
    const value = Number(item[valueKey]);

    if (value === 0 || !value || isNaN(value)) {
      zeroCount++;
      if (lastValidValue !== null) {
        filledCount++;
        return { ...item, [valueKey]: lastValidValue };
      }
      return item; // Keep zero if no prior valid value (will back-fill)
    }

    lastValidValue = value;
    return item;
  });

  // Second pass: back-fill any remaining zeros at the start
  const firstValidValue = result.find(item => {
    const val = Number(item[valueKey]);
    return val > 0 && !isNaN(val);
  })?.[valueKey];

  if (firstValidValue) {
    for (let i = 0; i < result.length; i++) {
      const value = Number(result[i][valueKey]);
      if (value === 0 || !value || isNaN(value)) {
        result[i] = { ...result[i], [valueKey]: firstValidValue };
        filledCount++;
      } else {
        break; // Stop at first valid value
      }
    }
  }

  return { filled: result, zeroCount, filledCount };
}

// Process raw data without aggregation
function processRawData(
  snapshots: any[]
): ChartDataPoint[] {
  if (!snapshots.length) return [];

  // Create a map of timestamps to data points
  const timestampMap = new Map<number, ChartDataPoint>();

  // Process all snapshots without aggregation
  snapshots.forEach((snapshot) => {
    // Force UTC parsing: Supabase returns timestamps without 'Z', causing local time interpretation
    const timestamp = new Date(snapshot.timestamp + 'Z').getTime();

    if (!timestampMap.has(timestamp)) {
      timestampMap.set(timestamp, {
        timestamp,
        date: new Date(timestamp).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }),
      });
    }

    const point = timestampMap.get(timestamp)!;
    point[snapshot.agent_id] = snapshot.total_portfolio_value_usd;
  });

  // Convert to array and sort by timestamp
  const result = Array.from(timestampMap.values()).sort((a, b) => a.timestamp - b.timestamp);

  return result;
}

// Initial chart data - fetch server-side for faster initial render
async function getInitialChartData(range: TimeRange = "24H"): Promise<ChartDataPoint[]> {
  try {
    const rangeConfig = TIME_RANGES[range];

    if (process.env.NODE_ENV === 'development') {
      console.log(`Fetching ${range} data...`);
    }

    // Calculate time filter based on range (null for ALL)
    let timeFilter: Date | null = null;
    if (rangeConfig.hours !== null) {
      timeFilter = new Date();
      timeFilter.setHours(timeFilter.getHours() - rangeConfig.hours);
      if (process.env.NODE_ENV === 'development') {
        console.log('From:', timeFilter.toISOString());
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching ALL historical data...');
      }
    }

    // Fetch snapshots using pagination (Supabase has 1000 row limit)
    let snapshots: any[] = [];
    let offset = 0;
    const batchSize = 1000;
    let hasMore = true;

    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching snapshots in batches...');
    }

    while (hasMore) {
      let query = supabaseServer
        .from("portfolio_snapshots")
        .select("agent_id, timestamp, total_portfolio_value_usd");

      // Apply time filter if not ALL
      if (timeFilter) {
        query = query.gte("timestamp", timeFilter.toISOString());
      }

      const { data: batch } = await query
        .order("timestamp", { ascending: true })
        .range(offset, offset + batchSize - 1);

      if (batch && batch.length > 0) {
        snapshots.push(...batch);
        if (process.env.NODE_ENV === 'development') {
          console.log(`Fetched batch ${Math.floor(offset / batchSize) + 1}: ${batch.length} rows (total: ${snapshots.length})`);
        }
        offset += batchSize;
        hasMore = batch.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    if (!snapshots || snapshots.length === 0) {
      return [];
    }

    // Apply forward-fill to handle zero/missing values
    const { filled: filledSnapshots, zeroCount: snapshotZeros, filledCount: snapshotFills } =
      forwardFillTimeSeries(snapshots, 'timestamp', 'total_portfolio_value_usd');

    if (process.env.NODE_ENV === 'development') {
      console.log('=== DATA QUALITY ===');
      console.log(`Snapshots: ${snapshotZeros} zeros found, ${snapshotFills} values forward-filled`);
    }

    // Return all raw data without aggregation
    const result = processRawData(filledSnapshots);

    // DEBUG: Log data info
    if (process.env.NODE_ENV === 'development') {
      console.log('=== SERVER: Chart Data Summary ===');
      console.log('Total snapshots fetched:', snapshots.length);
      console.log('Total data points created:', result.length);
      if (result.length > 0) {
        console.log('First timestamp (ms):', result[0].timestamp);
        console.log('Last timestamp (ms):', result[result.length - 1].timestamp);
        console.log('First date (UTC):', new Date(result[0].timestamp).toISOString());
        console.log('Last date (UTC):', new Date(result[result.length - 1].timestamp).toISOString());
        const durationHours = (result[result.length - 1].timestamp - result[0].timestamp) / (1000 * 60 * 60);
        console.log('Duration (hours):', durationHours.toFixed(2));
      }
      console.log('===================================');
    }

    return result;
  } catch (error) {
    console.error("Error fetching initial chart data:", error);
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

  // Fetch all data in parallel
  const [agentStats, latestTrades, latestDecisions, latestTweets] = await Promise.all([
    getAgentStats(),
    getLatestTrades(20),
    getLatestDecisions(20),
    getLatestTweets(20),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader agentStats={agentStats} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Content - Chart + Performance */}
        <div className="flex-1 flex flex-col">
          {/* Chart Section */}
          <div className="flex-1 border-b-2 lg:border-b-0 lg:border-r-2 border-border">
            <ChartContainer initialData={initialData} activeRange={validRange} />
          </div>

          {/* Agent Performance */}
          <AgentPerformanceGrid stats={agentStats} />
        </div>

        {/* Right Sidebar - Tabbed Info (Desktop only) */}
        <div className="hidden lg:block w-96 flex-shrink-0">
          <SidebarTabs trades={latestTrades} decisions={latestDecisions} tweets={latestTweets} />
        </div>
      </div>

      {/* Mobile Sidebar Section - FIXED: max-h instead of h for better scrolling */}
      <div className="lg:hidden border-t-2 border-border max-h-[500px]">
        <SidebarTabs trades={latestTrades} decisions={latestDecisions} tweets={latestTweets} />
      </div>
    </div>
  );
}
