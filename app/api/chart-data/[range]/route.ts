import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { SOL_BASELINE, TIME_RANGES } from "@/lib/constants";
import type { TimeRange } from "@/lib/constants";
import { ChartDataPoint } from "@/lib/types";

export const revalidate = 60; // Cache for 60 seconds

const DEFAULT_RANGE: TimeRange = "24H";
const VALID_RANGES = Object.keys(TIME_RANGES) as TimeRange[];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ range: string }> }
) {
  try {
    const { range: rawRange } = await params;
    const requestedRange = rawRange?.toUpperCase() as TimeRange | undefined;
    const range = requestedRange && VALID_RANGES.includes(requestedRange)
      ? requestedRange
      : DEFAULT_RANGE;

    const timeRange = TIME_RANGES[range];

    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - timeRange.hours);

    // Fetch portfolio snapshots for all agents
    const { data: snapshots, error } = await supabaseServer
      .from("portfolio_snapshots")
      .select("agent_id, timestamp, total_portfolio_value_usd")
      .gte("timestamp", hoursAgo.toISOString())
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("Error fetching snapshots:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch SOL price history
    const { data: solPrices, error: solError } = await supabaseServer
      .from("sol_price_history")
      .select("timestamp, price_usd")
      .gte("timestamp", hoursAgo.toISOString())
      .order("timestamp", { ascending: true });

    if (solError) {
      console.error("Error fetching SOL prices:", solError);
    }

    // Get starting balances for agents (assumed 1 SOL each = $200 starting)
    const startingSolBalance = 1.0;

    // Aggregate data if needed
    const aggregatedData = aggregateData(
      snapshots || [],
      solPrices || [],
      timeRange.aggregation,
      startingSolBalance
    );

    return NextResponse.json(aggregatedData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function aggregateData(
  snapshots: any[],
  solPrices: any[],
  aggregationMinutes: number,
  startingSolBalance: number
): ChartDataPoint[] {
  if (!snapshots.length) return [];

  // Create time buckets
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
  solPrices.forEach((price) => {
    const timestamp = new Date(price.timestamp).getTime();
    const bucketTime = Math.floor(timestamp / (aggregationMinutes * 60 * 1000)) * (aggregationMinutes * 60 * 1000);
    solPriceMap.set(bucketTime, price.price_usd);
  });

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

    // Add SOL baseline (holding SOL from start)
    const solPrice = solPriceMap.get(bucketTime);
    if (solPrice) {
      point[SOL_BASELINE.id] = startingSolBalance * solPrice;
    }

    dataPoints.push(point);
  });

  return dataPoints.sort((a, b) => a.timestamp - b.timestamp);
}


