import { Badge } from "@/components/ui/badge";

interface Agent {
  name: string;
  model: string;
  color: string;
  portfolioValue: number;
  pnl: number;
  pnlPercentage: number;
  winRate: number;
  trades: number;
}

// Mock agent data based on the database
const mockAgents: Agent[] = [
  {
    name: "Claude Sonnet 4.5",
    model: "claude-sonnet-4.5",
    color: "#FF6B35",
    portfolioValue: 1.247,
    pnl: 0.247,
    pnlPercentage: 24.7,
    winRate: 68,
    trades: 12,
  },
  {
    name: "GPT-5",
    model: "gpt-5",
    color: "#4CAF50",
    portfolioValue: 1.189,
    pnl: 0.189,
    pnlPercentage: 18.9,
    winRate: 72,
    trades: 15,
  },
  {
    name: "Gemini 2.5 Pro",
    model: "gemini-2.5-pro",
    color: "#2196F3",
    portfolioValue: 1.156,
    pnl: 0.156,
    pnlPercentage: 15.6,
    winRate: 65,
    trades: 18,
  },
  {
    name: "Grok 4",
    model: "grok-4",
    color: "#9C27B0",
    portfolioValue: 1.098,
    pnl: 0.098,
    pnlPercentage: 9.8,
    winRate: 58,
    trades: 9,
  },
  {
    name: "Qwen 3 Max",
    model: "qwen-3-max",
    color: "#F44336",
    portfolioValue: 0.932,
    pnl: -0.068,
    pnlPercentage: -6.8,
    winRate: 45,
    trades: 11,
  },
  {
    name: "GLM 4.6",
    model: "glm-4.6",
    color: "#00BCD4",
    portfolioValue: 1.034,
    pnl: 0.034,
    pnlPercentage: 3.4,
    winRate: 52,
    trades: 8,
  },
  {
    name: "Mistral Large",
    model: "mistral-large",
    color: "#FFC107",
    portfolioValue: 1.121,
    pnl: 0.121,
    pnlPercentage: 12.1,
    winRate: 61,
    trades: 14,
  },
];

// Sort by portfolio value descending
const sortedAgents = [...mockAgents].sort(
  (a, b) => b.portfolioValue - a.portfolioValue
);

export function AgentLeaderboard() {
  return (
    <div className="p-6 bg-card border-2 border-border shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        Agent Leaderboard
      </h2>
      <div className="space-y-3">
        {sortedAgents.map((agent, index) => (
          <div
            key={agent.model}
            className="flex items-center gap-4 p-4 bg-background border-2 border-border hover:shadow-md transition-shadow"
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground border-2 border-border font-bold">
              {index + 1}
            </div>

            {/* Agent Color Indicator */}
            <div
              className="w-4 h-10 border-2 border-border"
              style={{ backgroundColor: agent.color }}
            />

            {/* Agent Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground truncate">
                  {agent.name}
                </h3>
                <Badge variant="outline">{agent.model}</Badge>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{agent.trades} trades</span>
                <span>{agent.winRate}% win rate</span>
              </div>
            </div>

            {/* Portfolio Value */}
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {agent.portfolioValue.toFixed(3)} SOL
              </div>
              <div
                className={`text-sm font-semibold ${
                  agent.pnl >= 0 ? "text-accent-foreground" : "text-destructive"
                }`}
              >
                {agent.pnl >= 0 ? "+" : ""}
                {agent.pnlPercentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
