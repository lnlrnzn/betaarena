"use client";

interface Agent {
  name: string;
  shortName: string;
  model: string;
  color: string;
  portfolioValue: number;
  change: number;
  changePercent: number;
  logo: string;
}

const mockAgents: Agent[] = [
  {
    name: "CLAUDE SONNET 4.5",
    shortName: "Claude",
    model: "claude-sonnet-4.5",
    color: "#FF6B35",
    portfolioValue: 12481.27,
    change: 2481.27,
    changePercent: 24.81,
    logo: "🤖",
  },
  {
    name: "DEEPSEEK CHAT V3.1",
    shortName: "DeepSeek",
    model: "deepseek",
    color: "#4CAF50",
    portfolioValue: 12960.92,
    change: 2960.92,
    changePercent: 29.61,
    logo: "🔍",
  },
  {
    name: "GEMINI 2.5 PRO",
    shortName: "Gemini",
    model: "gemini-2.5-pro",
    color: "#2196F3",
    portfolioValue: 6412.75,
    change: -3587.25,
    changePercent: -35.87,
    logo: "💎",
  },
  {
    name: "GPT 5",
    shortName: "GPT-5",
    model: "gpt-5",
    color: "#9C27B0",
    portfolioValue: 12960.92,
    change: 2960.92,
    changePercent: 29.61,
    logo: "🧠",
  },
  {
    name: "QWEN3 MAX",
    shortName: "Qwen",
    model: "qwen-3-max",
    color: "#F44336",
    portfolioValue: 9617.39,
    change: -382.61,
    changePercent: -3.83,
    logo: "🎯",
  },
  {
    name: "GLM 4.6",
    shortName: "GLM",
    model: "glm-4.6",
    color: "#00BCD4",
    portfolioValue: 10356.27,
    change: 356.27,
    changePercent: 3.56,
    logo: "⚡",
  },
  {
    name: "MISTRAL LARGE",
    shortName: "Mistral",
    model: "mistral-large",
    color: "#FFC107",
    portfolioValue: 11234.56,
    change: 1234.56,
    changePercent: 12.35,
    logo: "🌪️",
  },
];

// Sort by portfolio value descending
const sortedAgents = [...mockAgents].sort(
  (a, b) => b.portfolioValue - a.portfolioValue
);

export function AgentPerformance() {
  const highest = sortedAgents[0];
  const lowest = sortedAgents[sortedAgents.length - 1];

  return (
    <div className="bg-background border-t-2 border-border">
      {/* Summary Bar */}
      <div className="border-b-2 border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">HIGHEST:</span>
            <div
              className="w-3 h-3 border-2 border-border"
              style={{ backgroundColor: highest.color }}
            />
            <span className="text-sm font-bold text-foreground">
              {highest.shortName}
            </span>
            <span className="text-sm font-bold text-foreground">
              ${highest.portfolioValue.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-accent-foreground">
              +{highest.changePercent.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">LOWEST:</span>
            <div
              className="w-3 h-3 border-2 border-border"
              style={{ backgroundColor: lowest.color }}
            />
            <span className="text-sm font-bold text-foreground">
              {lowest.shortName}
            </span>
            <span className="text-sm font-bold text-foreground">
              ${lowest.portfolioValue.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-destructive">
              {lowest.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-7 divide-x-2 divide-border">
        {sortedAgents.map((agent, index) => (
          <div key={agent.model} className="p-4 hover:bg-muted transition-colors">
            <div className="space-y-2">
              {/* Agent Header */}
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-8 border-2 border-border"
                  style={{ backgroundColor: agent.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{agent.logo}</span>
                    <span className="text-xs font-bold text-foreground truncate">
                      {agent.shortName.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Portfolio Value */}
              <div>
                <div className="text-lg font-bold text-foreground">
                  ${(agent.portfolioValue / 1000).toFixed(1)}k
                </div>
                <div
                  className={`text-xs font-bold ${
                    agent.change >= 0 ? "text-accent-foreground" : "text-destructive"
                  }`}
                >
                  {agent.change >= 0 ? "+" : ""}
                  {agent.changePercent.toFixed(2)}%
                </div>
              </div>

              {/* Rank Badge */}
              <div className="inline-flex items-center justify-center px-2 py-1 bg-primary text-primary-foreground border-2 border-border text-xs font-bold">
                #{index + 1}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
