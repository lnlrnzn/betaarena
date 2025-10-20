// SolanaTracker API Client
const BASE_URL = 'https://data.solanatracker.io';
const API_KEY = process.env.SOLANATRACKER_API_KEY!;

const WSOL_MINT = 'So11111111111111111111111111111111111111112';

// Headers for all requests
const headers = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
};

// Types
export interface TokenPrice {
  token: string;
  priceUsd: number;
  liquidityUsd?: number;
  marketCapUsd?: number;
  lastUpdated: number;
}

export interface WalletToken {
  mint: string;
  name: string;
  symbol: string;
  image: string;
  decimals: number;
  balance: number;
  valueUsd: number;
  priceUsd: number;
}

export interface WalletSummary {
  totalUsd: number;
  totalSol: number;
  timestamp: string;
}

export interface WalletPortfolio {
  owner: string;
  tokens: WalletToken[];
  summary: WalletSummary;
}

export interface TokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  image: string;
  decimals: number;
  uri?: string;
  description?: string;
  pools?: Array<{
    address: string;
    priceUsd: number;
    liquidityUsd: number;
    marketCapUsd: number;
  }>;
}

export interface Trade {
  signature: string;
  type: 'buy' | 'sell';
  program: string;
  timestamp: number;
  from: {
    mint: string;
    amount: number;
    name?: string;
    symbol?: string;
  };
  to: {
    mint: string;
    amount: number;
    name?: string;
    symbol?: string;
  };
  priceUsd: number;
  volumeUsd: number;
  volumeSol: number;
}

export interface TradesResponse {
  trades: Trade[];
  hasNextPage: boolean;
  nextCursor?: string;
}

// Retry logic with exponential backoff
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
      });

      if (response.status === 429) {
        // Rate limit - wait and retry
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        console.warn(`Rate limited, waiting ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Wait before retry
      const waitTime = Math.pow(2, i) * 1000 + Math.random() * 1000; // Jitter
      console.warn(`Attempt ${i + 1} failed, retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Get current SOL price in USD
 */
export async function getSolPrice(): Promise<TokenPrice> {
  const url = `${BASE_URL}/price?token=${WSOL_MINT}&priceChanges=false`;
  return fetchWithRetry<TokenPrice>(url);
}

/**
 * Get wallet portfolio (all holdings + summary)
 */
export async function getWalletPortfolio(
  walletAddress: string
): Promise<WalletPortfolio> {
  const url = `${BASE_URL}/wallet/${walletAddress}`;
  return fetchWithRetry<WalletPortfolio>(url);
}

/**
 * Get wallet portfolio (basic version for faster response)
 */
export async function getWalletPortfolioBasic(
  walletAddress: string
): Promise<WalletPortfolio> {
  const url = `${BASE_URL}/wallet/${walletAddress}/basic`;
  return fetchWithRetry<WalletPortfolio>(url);
}

/**
 * Get token metadata
 */
export async function getTokenMetadata(
  tokenMint: string
): Promise<TokenMetadata> {
  const url = `${BASE_URL}/tokens/${tokenMint}`;
  const response = await fetchWithRetry<{ token: TokenMetadata }>(url);
  return response.token;
}

/**
 * Get multiple token metadata (batch - up to 20 tokens)
 */
export async function getTokensMetadata(
  tokenMints: string[]
): Promise<TokenMetadata[]> {
  if (tokenMints.length > 20) {
    throw new Error('Maximum 20 tokens per batch request');
  }

  const url = `${BASE_URL}/tokens/multi`;
  const response = await fetchWithRetry<{ tokens: TokenMetadata[] }>(url, {
    method: 'POST',
    body: JSON.stringify({ tokens: tokenMints }),
  });

  return response.tokens;
}

/**
 * Get wallet trade history
 */
export async function getWalletTrades(
  walletAddress: string,
  options: {
    cursor?: string;
    showMeta?: boolean;
    parseJupiter?: boolean;
    hideArb?: boolean;
  } = {}
): Promise<TradesResponse> {
  const params = new URLSearchParams({
    ...(options.cursor && { cursor: options.cursor }),
    ...(options.showMeta !== undefined && { showMeta: String(options.showMeta) }),
    ...(options.parseJupiter !== undefined && { parseJupiter: String(options.parseJupiter) }),
    ...(options.hideArb !== undefined && { hideArb: String(options.hideArb) }),
  });

  const url = `${BASE_URL}/wallet/${walletAddress}/trades?${params}`;
  return fetchWithRetry<TradesResponse>(url);
}

/**
 * Get all wallet trades (with pagination)
 */
export async function getAllWalletTrades(
  walletAddress: string,
  maxPages = 10
): Promise<Trade[]> {
  const allTrades: Trade[] = [];
  let cursor: string | undefined;
  let page = 0;

  while (page < maxPages) {
    const response = await getWalletTrades(walletAddress, {
      cursor,
      showMeta: true,
      parseJupiter: true,
      hideArb: true,
    });

    allTrades.push(...response.trades);

    if (!response.hasNextPage || !response.nextCursor) break;

    cursor = response.nextCursor;
    page++;
  }

  return allTrades;
}

/**
 * Check API credits/subscription status
 */
export async function checkApiCredits(): Promise<any> {
  const url = `${BASE_URL}/credits`;
  return fetchWithRetry(url);
}

export async function checkSubscription(): Promise<any> {
  const url = `${BASE_URL}/subscription`;
  return fetchWithRetry(url);
}
