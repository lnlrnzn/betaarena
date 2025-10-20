"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, LineData, Time } from "lightweight-charts";
import { AGENTS, SOL_BASELINE } from "@/lib/constants";
import { ChartDataPoint } from "@/lib/types";

interface PortfolioChartProps {
  initialData: ChartDataPoint[];
  timeRange: string;
}

export function PortfolioChartLightweight({ initialData, timeRange }: PortfolioChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());

  // Track which agents are visible (all visible by default)
  const [visibleAgents, setVisibleAgents] = useState<Set<string>>(
    new Set([
      ...Object.values(AGENTS).map((a) => a.id),
      SOL_BASELINE.id,
    ])
  );

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#71717a",
        fontSize: 11,
        fontFamily: "Geist Mono, monospace",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: {
          color: "rgba(113, 113, 122, 0.1)",
          style: 3,
          visible: true,
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(113, 113, 122, 0.3)",
          width: 1,
          style: 3,
          labelVisible: false,
        },
        horzLine: {
          color: "rgba(113, 113, 122, 0.3)",
          width: 1,
          style: 3,
          labelVisible: true,
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Create series for each agent
    const allAgents = [...Object.values(AGENTS), SOL_BASELINE];

    allAgents.forEach((agent) => {
      const series = chart.addLineSeries({
        color: agent.color,
        lineWidth: 1.5,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: agent.color,
        crosshairMarkerBackgroundColor: agent.color,
        lastValueVisible: true,
        priceLineVisible: false,
      });

      seriesRef.current.set(agent.id, series);
    });

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update data when initialData changes
  useEffect(() => {
    if (!chartRef.current || !initialData.length) return;

    const allAgents = [...Object.values(AGENTS), SOL_BASELINE];

    allAgents.forEach((agent) => {
      const series = seriesRef.current.get(agent.id);
      if (!series) return;

      const seriesData: LineData[] = initialData.map((point) => ({
        time: (point.timestamp / 1000) as Time,
        value: Number(point[agent.id] || 0),
      }));

      series.setData(seriesData);
    });

    chartRef.current.timeScale().fitContent();
  }, [initialData]);

  // Update series visibility when visibleAgents changes
  useEffect(() => {
    const allAgents = [...Object.values(AGENTS), SOL_BASELINE];

    allAgents.forEach((agent) => {
      const series = seriesRef.current.get(agent.id);
      if (!series) return;

      series.applyOptions({
        visible: visibleAgents.has(agent.id),
      });
    });
  }, [visibleAgents]);

  const toggleAgent = (agentId: string) => {
    setVisibleAgents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        // Don't allow hiding all agents
        if (newSet.size > 1) {
          newSet.delete(agentId);
        }
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chart */}
      <div
        ref={chartContainerRef}
        className="flex-1 bg-card border-2 border-border"
        style={{ minHeight: "400px", height: "100%" }}
      />

      {/* Legend / Toggle Controls */}
      <div className="bg-background border-2 border-t-0 border-border p-4">
        <div className="flex flex-wrap gap-3">
          {[...Object.values(AGENTS), SOL_BASELINE].map((agent) => (
            <button
              key={agent.id}
              onClick={() => toggleAgent(agent.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs border-2 transition-all ${
                visibleAgents.has(agent.id)
                  ? "border-border bg-card"
                  : "border-border bg-muted opacity-50"
              }`}
            >
              <div
                className="w-3 h-3 border-2 border-border"
                style={{ backgroundColor: agent.color }}
              />
              <span className="font-medium">{agent.shortName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
