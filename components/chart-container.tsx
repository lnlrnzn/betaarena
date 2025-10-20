"use client";

import { useState, useEffect } from "react";
import { PortfolioChartLightweight } from "./portfolio-chart-lightweight";
import { ChartDataPoint } from "@/lib/types";
import { TIME_RANGES, TimeRange } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

interface ChartContainerProps {
  initialData: ChartDataPoint[];
  initialRange: TimeRange;
}

export function ChartContainer({ initialData, initialRange }: ChartContainerProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>(initialData);
  const [selectedRange, setSelectedRange] = useState<TimeRange>(initialRange);
  const [isLoading, setIsLoading] = useState(false);

  // Handle time range changes
  const handleRangeChange = async (range: TimeRange) => {
    setIsLoading(true);
    setSelectedRange(range);

    try {
      const response = await fetch(`/api/chart-data?range=${range}`);
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("portfolio_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "portfolio_snapshots",
        },
        (payload) => {
          console.log("New snapshot:", payload);
          // Append new data point to chart
          const newSnapshot = payload.new as any;

          setChartData((prev) => {
            const lastPoint = prev[prev.length - 1] || { timestamp: 0 };
            const newTimestamp = new Date(newSnapshot.timestamp).getTime();

            // Only update if it's a newer timestamp
            if (newTimestamp <= lastPoint.timestamp) return prev;

            // Find or create data point for this timestamp
            const existingPointIndex = prev.findIndex(
              (p) => p.timestamp === newTimestamp
            );

            if (existingPointIndex >= 0) {
              // Update existing point
              const updated = [...prev];
              updated[existingPointIndex] = {
                ...updated[existingPointIndex],
                [newSnapshot.agent_id]: newSnapshot.total_portfolio_value_usd,
              };
              return updated;
            } else {
              // Add new point
              const newPoint: ChartDataPoint = {
                timestamp: newTimestamp,
                date: new Date(newTimestamp).toLocaleString(),
                [newSnapshot.agent_id]: newSnapshot.total_portfolio_value_usd,
              };
              return [...prev, newPoint];
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Time Range Selector */}
      <div className="bg-background border-2 border-b-0 border-border px-6 py-3">
        <div className="flex items-center gap-2">
          {Object.keys(TIME_RANGES).map((range) => (
            <button
              key={range}
              onClick={() => handleRangeChange(range as TimeRange)}
              disabled={isLoading}
              className={`px-4 py-1.5 text-xs font-bold border-2 border-border transition-colors ${
                selectedRange === range
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {range}
            </button>
          ))}
          {isLoading && (
            <span className="text-xs text-muted-foreground ml-2">Loading...</span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <PortfolioChartLightweight
          initialData={chartData}
          timeRange={selectedRange}
        />
      </div>
    </div>
  );
}
