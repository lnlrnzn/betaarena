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
  "mistral-large": {
    id: "32c614c8-c36b-49a6-abd1-a36620dfd359",
    name: "Mistral Large",
    shortName: "Mistral",
    model: "mistral-large",
    color: "#FFC107",
    logo: "/logos/mistral.svg",
    logoFallback: "M",
  },
} as const;

// SOL baseline for comparison
export const SOL_BASELINE = {
  id: "sol-baseline",
  name: "SOL (HODL)",
  shortName: "SOL",
  model: "sol-baseline",
  color: "#9945FF",
  logo: "/logos/sol-baseline.png",
  logoFallback: "◎",
};

export type AgentKey = keyof typeof AGENTS;
export type Agent = typeof AGENTS[AgentKey];

// $ARENA Token Configuration
export const ARENA_TOKEN = {
  name: "$ARENA",
  symbol: "ARENA",
  totalSupply: 1_000_000_000, // 1 billion tokens
  contractAddress: null, // Will be set after deployment
  decimals: 9,
} as const;

// Reward Tier System (Whale-Skewed Distribution)
export const REWARD_TIERS = {
  MEGA_WHALE: {
    name: "MEGA WHALE",
    minTokens: 15_000_000, // 1.5% of supply
    maxTokens: null,
    poolShare: 0.50, // 50% of reward pool
    description: "1.5%+ of supply",
  },
  WHALE: {
    name: "WHALE",
    minTokens: 10_000_000, // 1% of supply
    maxTokens: 15_000_000,
    poolShare: 0.25, // 25% of reward pool
    description: "1.0% - 1.5% of supply",
  },
  BIG_BAG: {
    name: "BIG BAG",
    minTokens: 6_000_000, // 0.6% of supply
    maxTokens: 10_000_000,
    poolShare: 0.12, // 12% of reward pool
    description: "0.6% - 1.0% of supply",
  },
  HOLDER: {
    name: "HOLDER",
    minTokens: 4_000_000, // 0.4% of supply
    maxTokens: 6_000_000,
    poolShare: 0.07, // 7% of reward pool
    description: "0.4% - 0.6% of supply",
  },
  DEGEN: {
    name: "DEGEN",
    minTokens: 2_500_000, // 0.25% of supply
    maxTokens: 4_000_000,
    poolShare: 0.04, // 4% of reward pool
    description: "0.25% - 0.4% of supply",
  },
  BELIEVER: {
    name: "BELIEVER",
    minTokens: 2_000_000, // 0.2% of supply (minimum eligibility)
    maxTokens: 2_500_000,
    poolShare: 0.02, // 2% of reward pool
    description: "0.2% - 0.25% of supply",
  },
} as const;

// Early Declaration Multipliers
export const DECLARATION_MULTIPLIERS = {
  DAYS_1_2: {
    days: [1, 2],
    multiplier: 2.0,
    label: "ULTRA EARLY",
  },
  DAYS_3_4: {
    days: [3, 4],
    multiplier: 1.5,
    label: "EARLY",
  },
  DAYS_5_6: {
    days: [5, 6],
    multiplier: 1.25,
    label: "LATE",
  },
  DAY_7: {
    days: [7],
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
