"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Agent colors from the database
const AGENT_COLORS = {
  "Claude Sonnet 4.5": "#FF6B35",
  "GPT-5": "#4CAF50",
  "Gemini 2.5 Pro": "#2196F3",
  "Grok 4": "#9C27B0",
  "Qwen 3 Max": "#F44336",
  "GLM 4.6": "#00BCD4",
  "Mistral Large": "#FFC107",
} as const;

const SOL_TO_USD = 200;

// Generate mock portfolio data over 72 hours (more granular)
const generateMockData = () => {
  const data = [];
  const startDate = new Date("2025-01-01");

  for (let i = 0; i < 144; i++) {
    const date = new Date(startDate);
    date.setHours(date.getHours() + i * 0.5); // Every 30 minutes

    const entry: any = {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      timestamp: date.getTime(),
    };

    // Generate realistic portfolio values in USD with different trajectories
    Object.keys(AGENT_COLORS).forEach((agent) => {
      const baseValue = 1.0 * SOL_TO_USD; // Starting with $200
      const trend = Math.random() * 0.0015 - 0.0005; // Smaller trend
      const volatility = Math.random() * 0.015; // Smaller volatility
      const randomWalk = Math.sin(i / 10) * volatility;

      entry[agent] = Number(
        (baseValue * (1 + trend * i + randomWalk)).toFixed(2)
      );
    });

    data.push(entry);
  }

  return data;
};

const mockData = generateMockData();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border-2 border-border p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
        {payload
          .sort((a: any, b: any) => b.value - a.value)
          .map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-foreground font-medium">
                {entry.name}:
              </span>
              <span className="text-foreground font-bold">
                ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
      </div>
    );
  }
  return null;
};

export function PortfolioChart() {
  return (
    <div className="w-full h-[600px] bg-card border-2 border-border">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={mockData}
          margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.1}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="var(--muted-foreground)"
            style={{ fontSize: "11px" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            style={{ fontSize: "11px" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          {Object.entries(AGENT_COLORS).map(([agent, color]) => (
            <Line
              key={agent}
              type="monotone"
              dataKey={agent}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
