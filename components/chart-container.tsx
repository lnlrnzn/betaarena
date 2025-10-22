"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PortfolioChartLightweight } from "./portfolio-chart-lightweight";
import { ChartDataPoint } from "@/lib/types";
import { TIME_RANGES, TimeRange } from "@/lib/constants";
import { useRealtime } from "@/components/providers/realtime-provider";

interface ChartContainerProps {
  initialData: ChartDataPoint[];
  activeRange: TimeRange;
}

export function ChartContainer({ initialData, activeRange }: ChartContainerProps) {
  const chartRef = useRef<any>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(initialData);

  // Use global realtime context instead of individual subscription
  const { latestSnapshot } = useRealtime();

  // Handle real-time updates from global provider
  useEffect(() => {
    if (!latestSnapshot) return;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Chart] New snapshot received:', latestSnapshot);
    }

    setChartData(prev => {
      // Force UTC parsing: Supabase returns timestamps without 'Z', causing local time interpretation
      const timestamp = new Date(latestSnapshot.timestamp + 'Z').getTime();
      const existingIndex = prev.findIndex(p => p.timestamp === timestamp);

      if (existingIndex >= 0) {
        // Update existing point
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          [latestSnapshot.agent_id]: latestSnapshot.total_portfolio_value_usd,
        };
        return updated;
      } else {
        // Add new point
        return [...prev, {
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
          [latestSnapshot.agent_id]: latestSnapshot.total_portfolio_value_usd,
        }].sort((a, b) => a.timestamp - b.timestamp);
      }
    });
  }, [latestSnapshot]);

  const handleZoomIn = () => {
    if (chartRef.current) {
      chartRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      chartRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (chartRef.current) {
      chartRef.current.resetView();
    }
  };

  const handleRangeChange = (range: TimeRange) => {
    setIsLoading(true);
    startTransition(() => {
      router.push(`/?range=${range.toLowerCase()}`);
    });
  };

  // Reset loading state when data changes
  useEffect(() => {
    setIsLoading(false);
  }, [initialData]);

  return (
    <div className="flex flex-col h-full">
      {/* Timeframe Selector */}
      <div className="bg-background border-2 border-b-0 border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground mr-2">TIMEFRAME:</span>
          {(Object.keys(TIME_RANGES) as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => handleRangeChange(range)}
              className={`px-4 py-1.5 text-xs font-bold border-2 transition-colors ${
                activeRange === range
                  ? "border-border bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="bg-background border-2 border-b-0 border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="px-4 py-1.5 text-xs font-bold border-2 border-border bg-background text-foreground hover:bg-muted transition-colors"
            title="Zoom In"
          >
            ZOOM IN +
          </button>
          <button
            onClick={handleZoomOut}
            className="px-4 py-1.5 text-xs font-bold border-2 border-border bg-background text-foreground hover:bg-muted transition-colors"
            title="Zoom Out"
          >
            ZOOM OUT −
          </button>
          <button
            onClick={handleResetView}
            className="px-4 py-1.5 text-xs font-bold border-2 border-border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            title="Reset to full view"
          >
            RESET VIEW
          </button>
          <span className="text-xs text-muted-foreground ml-2">
            Use mouse wheel to zoom, drag to pan
          </span>
          <span className="text-xs font-bold text-muted-foreground ml-auto border-l-2 border-border pl-4">
            ALL TIMES IN UTC
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 relative">
        <PortfolioChartLightweight
          ref={chartRef}
          initialData={chartData}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="flex flex-col items-center gap-4">
              {/* Spinner */}
              <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
              {/* Loading Text */}
              <div className="text-sm font-bold text-foreground">
                Loading {TIME_RANGES[activeRange].label} data...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

