// Agent configuration matching Supabase database
export const AGENTS = {
  "claude-sonnet-4.5": {
    id: "d8d17db6-eab8-4400-8632-1a549b3cb290",
    name: "Claude Sonnet 4.5",
    shortName: "Claude",
    model: "claude-sonnet-4.5",
    color: "#FF6B35",
    logo: "/logos/claude.svg",
    logoFallback: "C",
  },
  "gpt-5": {
    id: "0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc",
    name: "GPT-5",
    shortName: "GPT-5",
    model: "gpt-5",
    color: "#4CAF50",
    logo: "/logos/gpt5.svg",
    logoFallback: "G",
  },
  "gemini-2.5-pro": {
    id: "a73916de-5fa8-4085-906a-e3f7358d0e9e",
    name: "Gemini 2.5 Pro",
    shortName: "Gemini",
    model: "gemini-2.5-pro",
    color: "#2196F3",
    logo: "/logos/gemini.svg",
    logoFallback: "G",
  },
  "grok-4": {
    id: "d8ed8ce7-ea5b-48dd-a4ab-22488da3f2ce",
    name: "Grok 4",
    shortName: "Grok",
    model: "grok-4",
    color: "#9C27B0",
    logo: "/logos/grok.svg",
    logoFallback: "X",
  },
  "qwen-3-max": {
    id: "bd389a97-ed1b-47b3-be23-17063c662327",
    name: "Qwen 3 Max",
    shortName: "Qwen",
    model: "qwen-3-max",
    color: "#F44336",
    logo: "/logos/qwen.svg",
    logoFallback: "Q",
  },
  "glm-4.6": {
    id: "272ec813-4b15-4556-a8f9-33e5bee817f0",
    name: "GLM 4.6",
    shortName: "GLM",
    model: "glm-4.6",
    color: "#00BCD4",
    logo: "/logos/glm4-6.svg",
    logoFallback: "G",
  },
  "deepseek-v3": {
    id: "32c614c8-c36b-49a6-abd1-a36620dfd359",
    name: "DeepSeek V3",
    shortName: "DeepSeek",
    model: "deepseek-v3",
    color: "#FFC107",
    logo: "/logos/deepseek.png",
    logoFallback: "D",
  },
} as const;

export type AgentKey = keyof typeof AGENTS;
export type Agent = typeof AGENTS[AgentKey];

// $TLM Token Configuration
export const TLM_TOKEN = {
  name: "$TLM",
  symbol: "TLM",
  totalSupply: 1_000_000_000, // 1 billion tokens
  contractAddress: "3XAWJDr47NPzUfFgj3M6TamhRkJJQzgR86gizssBpump",
  decimals: 9,
} as const;

// Reward Tier System (3-Tier Distribution)
export const REWARD_TIERS = {
  WHALE: {
    name: "WHALE",
    minTokens: 10_000_000, // 1.0% of supply
    maxTokens: 15_000_000, // 1.5% of supply
    poolShare: 0.50, // 50% of reward pool
    description: "1.0% - 1.5% of supply",
  },
  BIG_BAG: {
    name: "BIG BAG",
    minTokens: 5_000_000, // 0.5% of supply
    maxTokens: 10_000_000, // 1.0% of supply
    poolShare: 0.35, // 35% of reward pool
    description: "0.5% - 1.0% of supply",
  },
  HOLDER: {
    name: "HOLDER",
    minTokens: 1_000_000, // 0.1% of supply (minimum eligibility)
    maxTokens: 5_000_000, // 0.5% of supply
    poolShare: 0.15, // 15% of reward pool
    description: "0.1% - 0.5% of supply",
  },
} as const;

// Early Declaration Multipliers
export const DECLARATION_MULTIPLIERS = {
  DAY_1: {
    days: [1],
    multiplier: 2.0,
    label: "ULTRA EARLY",
  },
  DAYS_2_3: {
    days: [2, 3],
    multiplier: 1.5,
    label: "EARLY",
  },
  DAYS_4_5: {
    days: [4, 5],
    multiplier: 1.25,
    label: "LATE",
  },
  DAYS_6_7: {
    days: [6, 7],
    multiplier: 1.0,
    label: "LAST MINUTE",
  },
} as const;

// Competition Configuration
export const COMPETITION_CONFIG = {
  cycleDuration: 7, // 7 days
  startingSolPerAgent: 1, // Each agent starts with 1 SOL
  dailyEliminationTime: "00:00", // UTC time for daily elimination
  minimumAgentsForConsensus: 4, // 4/7 agents must agree for super-agent to buy
} as const;

// Chart timeframe options
export const TIME_RANGES = {
  "6H": { label: "6H", hours: 6 },
  "24H": { label: "24H", hours: 24 },
  "7D": { label: "7D", hours: 168 },
  "ALL": { label: "ALL", hours: null },
} as const;

export type TimeRange = keyof typeof TIME_RANGES;
