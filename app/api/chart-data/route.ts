import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { TIME_RANGES, TimeRange } from '@/lib/constants';
import { ChartDataPoint } from '@/lib/types';

// Cache for 60 seconds (matches ISR in page.tsx)
export const revalidate = 60;

// Forward-fill utility to handle zero/missing values in time series data
// EXACT COPY from app/page.tsx to preserve data processing logic
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
// EXACT COPY from app/page.tsx to preserve chart data structure
function processRawData(
  snapshots: any[]
): ChartDataPoint[] {
  if (!snapshots.length) return [];

  // Create a map of timestamps to data points
  const timestampMap = new Map<number, ChartDataPoint>();

  // Process all snapshots without aggregation
  snapshots.forEach((snapshot) => {
    const timestamp = new Date(snapshot.timestamp).getTime();

    if (!timestampMap.has(timestamp)) {
      timestampMap.set(timestamp, {
        timestamp,
        date: new Date(timestamp).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const range = (searchParams.get('range')?.toUpperCase() as TimeRange) || '24H';

  // Validate range
  const validRange = TIME_RANGES[range] ? range : '24H';
  const rangeConfig = TIME_RANGES[validRange];

  try {
    // Calculate time filter based on range (null for ALL)
    let timeFilter: Date | null = null;
    if (rangeConfig.hours !== null) {
      timeFilter = new Date();
      timeFilter.setHours(timeFilter.getHours() - rangeConfig.hours);
    }

    // Query materialized view instead of base table for better performance
    let query = supabaseServer
      .from('chart_data_mv')
      .select('agent_id, timestamp, total_portfolio_value_usd');

    // Apply time filter if not ALL
    if (timeFilter) {
      query = query.gte('timestamp', timeFilter.toISOString());
    }

    // Single query - no pagination needed with materialized view
    const { data: snapshots, error } = await query.order('timestamp', { ascending: true });

    if (error) {
      console.error('[API] Chart data fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chart data' },
        { status: 500 }
      );
    }

    if (!snapshots || snapshots.length === 0) {
      return NextResponse.json([]);
    }

    // Apply forward-fill to handle zero/missing values
    const { filled: filledSnapshots } = forwardFillTimeSeries(
      snapshots,
      'timestamp',
      'total_portfolio_value_usd'
    );

    // Return all raw data without aggregation
    const result = processRawData(filledSnapshots);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Chart data error:', error);
    return NextResponse.json(
      { error: 'Failed to process chart data' },
      { status: 500 }
    );
  }
}
