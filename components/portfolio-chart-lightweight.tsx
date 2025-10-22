"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useTheme } from "next-themes";
import { createChart, IChartApi, ISeriesApi, LineData, Time, LogicalRange } from "lightweight-charts";
import { AGENTS } from "@/lib/constants";
import { ChartDataPoint } from "@/lib/types";

interface PortfolioChartProps {
  initialData: ChartDataPoint[];
}

export interface ChartHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

export const PortfolioChartLightweight = forwardRef<ChartHandle, PortfolioChartProps>(
  ({ initialData }, ref) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  const { theme } = useTheme();

  // Track which agents are visible (all visible by default)
  const [visibleAgents, setVisibleAgents] = useState<Set<string>>(
    new Set([
      ...Object.values(AGENTS).map((a) => a.id),
    ])
  );

  // Expose zoom methods to parent
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (!chartRef.current) return;
      const timeScale = chartRef.current.timeScale();
      const logicalRange = timeScale.getVisibleLogicalRange();
      if (!logicalRange) return;

      const diff = logicalRange.to - logicalRange.from;
      const center = (logicalRange.from + logicalRange.to) / 2;
      const newDiff = diff * 0.7; // Zoom in by 30%

      timeScale.setVisibleLogicalRange({
        from: center - newDiff / 2,
        to: center + newDiff / 2,
      });
    },
    zoomOut: () => {
      if (!chartRef.current) return;
      const timeScale = chartRef.current.timeScale();
      const logicalRange = timeScale.getVisibleLogicalRange();
      if (!logicalRange) return;

      const diff = logicalRange.to - logicalRange.from;
      const center = (logicalRange.from + logicalRange.to) / 2;
      const newDiff = diff * 1.4; // Zoom out by 40%

      timeScale.setVisibleLogicalRange({
        from: center - newDiff / 2,
        to: center + newDiff / 2,
      });
    },
    resetView: () => {
      if (!chartRef.current) return;
      chartRef.current.timeScale().fitContent();
    },
  }));

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = theme === "dark";
    const textColor = isDark ? "#71717a" : "#71717a";
    const gridColor = isDark ? "rgba(39, 39, 42, 0.3)" : "rgba(113, 113, 122, 0.1)";
    const crosshairColor = isDark ? "rgba(113, 113, 122, 0.5)" : "rgba(113, 113, 122, 0.3)";

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: textColor,
        fontSize: 11,
        fontFamily: "Geist Mono, monospace",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: {
          color: gridColor,
          style: 3,
          visible: true,
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: crosshairColor,
          width: 1,
          style: 3,
          labelVisible: false,
        },
        horzLine: {
          color: crosshairColor,
          width: 1,
          style: 3,
          labelVisible: true,
        },
      },
      leftPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      rightPriceScale: {
        visible: false,
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
    const allAgents = [...Object.values(AGENTS)];

    allAgents.forEach((agent) => {
      const series = chart.addLineSeries({
        color: agent.color,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: agent.color,
        crosshairMarkerBackgroundColor: agent.color,
        lastValueVisible: true,
        priceLineVisible: false,
        priceScaleId: 'left',
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
  }, [theme]);

  // Update data when initialData changes
  useEffect(() => {
    if (!chartRef.current || !initialData.length) return;

    // DEBUG: Log received data
    console.log('=== CLIENT: Chart Component Data ===');
    console.log('Data points received:', initialData.length);
    if (initialData.length > 0) {
      console.log('First point:', initialData[0]);
      console.log('Last point:', initialData[initialData.length - 1]);
      console.log('First time (unix):', initialData[0].timestamp / 1000);
      console.log('Last time (unix):', initialData[initialData.length - 1].timestamp / 1000);
    }
    console.log('===================================');

    const allAgents = [...Object.values(AGENTS)];

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
  }, [initialData, theme]); // Re-populate data when theme changes

  // Update series visibility when visibleAgents changes
  useEffect(() => {
    const allAgents = [...Object.values(AGENTS)];

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
      if (prev.has(agentId)) {
        // Agent is already visible - make it the only visible one (deselect all others)
        return new Set([agentId]);
      } else {
        // Agent is not visible - add it to the visible set
        const newSet = new Set(prev);
        newSet.add(agentId);
        return newSet;
      }
    });
  };

  const showAllAgents = () => {
    const allAgents = [...Object.values(AGENTS)];
    setVisibleAgents(new Set(allAgents.map((a) => a.id)));
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
          {/* Show All Button */}
          <button
            onClick={showAllAgents}
            className="px-3 py-1.5 text-xs font-bold border-2 border-border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            SHOW ALL
          </button>

          {Object.values(AGENTS).map((agent) => (
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
});

PortfolioChartLightweight.displayName = "PortfolioChartLightweight";

