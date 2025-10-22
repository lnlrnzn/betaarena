"use client";

import { useRef, useState, useEffect } from "react";
import { PortfolioChartLightweight } from "./portfolio-chart-lightweight";
import { ChartDataPoint, AgentStats } from "@/lib/types";
import { useRealtime } from "@/components/providers/realtime-provider";
import { EliminationCountdown } from "./elimination-countdown";

interface ChartContainerProps {
  initialData: ChartDataPoint[];
  agentStats: AgentStats[];
}

export function ChartContainer({ initialData, agentStats }: ChartContainerProps) {
  const chartRef = useRef<any>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(initialData);

  // Use global realtime context instead of individual subscription
  const { latestSnapshot } = useRealtime();

  // Handle real-time updates from global provider
  useEffect(() => {
    if (!latestSnapshot) return;

    // Ignore SYSTEM agent snapshots (SYSTEM is not a trading agent)
    if (latestSnapshot.agent_id === '00000000-0000-0000-0000-000000000000') {
      return;
    }

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
        // Add new point with forward-fill from previous timestamp
        // This prevents temporary zeros when agents update at different times
        const lastPoint = prev[prev.length - 1];
        const newPoint: ChartDataPoint = {
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
        };

        // Forward-fill all other agent values from the last point
        if (lastPoint) {
          Object.keys(lastPoint).forEach(key => {
            if (key !== 'timestamp' && key !== 'date' && !(key in newPoint)) {
              newPoint[key] = lastPoint[key];
            }
          });
        }

        return [...prev, newPoint].sort((a, b) => a.timestamp - b.timestamp);
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

  return (
    <div className="flex flex-col h-full">
      {/* Elimination Countdown Timer */}
      <EliminationCountdown agentStats={agentStats} />

      {/* Zoom Controls */}
      <div className="bg-background border-2 border-b-0 border-border px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <button
            onClick={handleZoomIn}
            className="px-2 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold border-2 border-border bg-background text-foreground hover:bg-muted transition-colors"
            title="Zoom In"
          >
            <span className="hidden sm:inline">ZOOM IN </span>+
          </button>
          <button
            onClick={handleZoomOut}
            className="px-2 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold border-2 border-border bg-background text-foreground hover:bg-muted transition-colors"
            title="Zoom Out"
          >
            <span className="hidden sm:inline">ZOOM OUT </span>−
          </button>
          <button
            onClick={handleResetView}
            className="px-2 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold border-2 border-border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            title="Reset to full view"
          >
            <span className="hidden sm:inline">RESET </span><span className="sm:hidden">↻ </span><span className="hidden sm:inline">VIEW</span>
          </button>
          <span className="hidden md:inline text-xs text-muted-foreground ml-2">
            Use mouse wheel to zoom, drag to pan
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground ml-auto border-l-2 border-border pl-2 sm:pl-4">
            <span className="hidden sm:inline">ALL TIMES IN </span>UTC
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 relative">
        <PortfolioChartLightweight
          ref={chartRef}
          initialData={chartData}
        />
      </div>
    </div>
  );
}

