// Agent configuration matching Supabase database
export const AGENTS = {
  "claude-sonnet-4.5": {
    id: "d8d17db6-eab8-4400-8632-1a549b3cb290",
    name: "Claude Sonnet 4.5",
    shortName: "Claude",
    model: "claude-sonnet-4.5",
    color: "#FF6B35",
    logo: "🤖",
  },
  "gpt-5": {
    id: "0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc",
    name: "GPT-5",
    shortName: "GPT-5",
    model: "gpt-5",
    color: "#4CAF50",
    logo: "🧠",
  },
  "gemini-2.5-pro": {
    id: "a73916de-5fa8-4085-906a-e3f7358d0e9e",
    name: "Gemini 2.5 Pro",
    shortName: "Gemini",
    model: "gemini-2.5-pro",
    color: "#2196F3",
    logo: "💎",
  },
  "grok-4": {
    id: "d8ed8ce7-ea5b-48dd-a4ab-22488da3f2ce",
    name: "Grok 4",
    shortName: "Grok",
    model: "grok-4",
    color: "#9C27B0",
    logo: "⚡",
  },
  "qwen-3-max": {
    id: "bd389a97-ed1b-47b3-be23-17063c662327",
    name: "Qwen 3 Max",
    shortName: "Qwen",
    model: "qwen-3-max",
    color: "#F44336",
    logo: "🎯",
  },
  "glm-4.6": {
    id: "272ec813-4b15-4556-a8f9-33e5bee817f0",
    name: "GLM 4.6",
    shortName: "GLM",
    model: "glm-4.6",
    color: "#00BCD4",
    logo: "🔮",
  },
  "mistral-large": {
    id: "32c614c8-c36b-49a6-abd1-a36620dfd359",
    name: "Mistral Large",
    shortName: "Mistral",
    model: "mistral-large",
    color: "#FFC107",
    logo: "🌪️",
  },
} as const;

// SOL baseline for comparison
export const SOL_BASELINE = {
  id: "sol-baseline",
  name: "SOL (HODL)",
  shortName: "SOL",
  model: "sol-baseline",
  color: "#9945FF",
  logo: "◎",
};

export type AgentKey = keyof typeof AGENTS;
export type Agent = typeof AGENTS[AgentKey];

// Time range options
export const TIME_RANGES = {
  "1H": { label: "1H", hours: 1, aggregation: 1 }, // 1 minute
  "24H": { label: "24H", hours: 24, aggregation: 1 }, // 1 minute
  "7D": { label: "7D", hours: 168, aggregation: 5 }, // 5 minutes
  "30D": { label: "30D", hours: 720, aggregation: 15 }, // 15 minutes
} as const;

export type TimeRange = keyof typeof TIME_RANGES;
