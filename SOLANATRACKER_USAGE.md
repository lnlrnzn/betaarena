# SolanaTracker API Usage Examples

Quick reference for using the SolanaTracker API utilities in your code.

## Import

```typescript
import {
  getSolPrice,
  getWalletPortfolio,
  getWalletPortfolioBasic,
  getTokenMetadata,
  getTokensMetadata,
  getWalletTrades,
  getAllWalletTrades,
  checkApiCredits,
  checkSubscription,
} from '@/lib/solanatracker';
```

---

## 1. Get SOL Price

```typescript
const solPrice = await getSolPrice();

console.log(solPrice);
// {
//   token: "So11111111111111111111111111111111111111112",
//   priceUsd: 198.45,
//   liquidityUsd: 360839586.03,
//   marketCapUsd: 9966765318.96,
//   lastUpdated: 1749298040053
// }
```

---

## 2. Get Wallet Portfolio (Full)

```typescript
const wallet = 'HVyp995fBANWnKPWdB11jBARaMrQqgyJZ6dqFyACi6vv';
const portfolio = await getWalletPortfolio(wallet);

console.log(portfolio);
// {
//   owner: "HVy...",
//   tokens: [
//     {
//       mint: "So11111...",
//       name: "Solana",
//       symbol: "SOL",
//       image: "https://.../sol.png",
//       decimals: 9,
//       balance: 2.3456789,
//       valueUsd: 465.12,
//       priceUsd: 198.45
//     },
//     { ... more tokens ... }
//   ],
//   summary: {
//     totalUsd: 588.57,
//     totalSol: 2.9654,
//     timestamp: "2025-10-20T12:49:06Z"
//   }
// }

// Access data
const totalValue = portfolio.summary.totalUsd;
const solBalance = portfolio.tokens.find(t => t.symbol === 'SOL')?.balance || 0;
const numPositions = portfolio.tokens.filter(t => t.balance > 0).length;
```

---

## 3. Get Wallet Portfolio (Basic - Faster)

For faster response when you don't need full metadata:

```typescript
const portfolio = await getWalletPortfolioBasic(wallet);
// Same structure, less cached metadata
```

---

## 4. Get Token Metadata

```typescript
// Single token
const tokenMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC
const metadata = await getTokenMetadata(tokenMint);

console.log(metadata);
// {
//   mint: "EPj...",
//   name: "USD Coin",
//   symbol: "USDC",
//   image: "https://.../usdc.png",
//   decimals: 6,
//   uri: "https://...",
//   description: "...",
//   pools: [
//     {
//       address: "...",
//       priceUsd: 1.0,
//       liquidityUsd: 123456.78,
//       marketCapUsd: 40000000000
//     }
//   ]
// }
```

---

## 5. Get Multiple Tokens Metadata (Batch)

```typescript
const tokenMints = [
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  // ... up to 20 tokens
];

const metadataList = await getTokensMetadata(tokenMints);

metadataList.forEach(token => {
  console.log(`${token.symbol}: $${token.pools?.[0]?.priceUsd}`);
});
```

---

## 6. Get Wallet Trade History

```typescript
const wallet = '4isFg6MFZDt1YYYAFFSgtY2fiMSKx82ueT5njMENTCDJ';

// Get first page of trades
const tradesResponse = await getWalletTrades(wallet, {
  showMeta: true,        // Include token metadata
  parseJupiter: true,    // Combine Jupiter aggregator swaps
  hideArb: true,         // Hide arbitrage/irrelevant transfers
});

console.log(tradesResponse);
// {
//   trades: [
//     {
//       signature: "5p...xyz",
//       type: "buy",
//       program: "Raydium",
//       timestamp: 1749298583015,
//       from: { mint: "So111...", amount: 0.5123 },
//       to: {
//         mint: "Dez...Mint",
//         amount: 12345.67,
//         name: "BONK",
//         symbol: "BONK"
//       },
//       priceUsd: 0.0001,
//       volumeUsd: 123.45,
//       volumeSol: 0.62
//     },
//     { ... more trades ... }
//   ],
//   hasNextPage: true,
//   nextCursor: "abc123..."
// }

// Get next page
if (tradesResponse.hasNextPage) {
  const nextPage = await getWalletTrades(wallet, {
    cursor: tradesResponse.nextCursor,
    showMeta: true,
    parseJupiter: true,
  });
}
```

---

## 7. Get ALL Wallet Trades (Auto-Pagination)

```typescript
// Fetches up to 10 pages automatically
const allTrades = await getAllWalletTrades(wallet, 10);

console.log(`Total trades: ${allTrades.length}`);

// Analyze trades
const buys = allTrades.filter(t => t.type === 'buy');
const sells = allTrades.filter(t => t.type === 'sell');
const totalVolume = allTrades.reduce((sum, t) => sum + t.volumeUsd, 0);

console.log(`Buys: ${buys.length}, Sells: ${sells.length}`);
console.log(`Total volume: $${totalVolume.toFixed(2)}`);
```

---

## 8. Check API Credits & Subscription

```typescript
// Check remaining credits
const credits = await checkApiCredits();
console.log(credits);

// Check subscription status
const subscription = await checkSubscription();
console.log(subscription);
```

---

## 9. Real-World Example: Calculate Agent P&L

```typescript
async function calculateAgentPnL(walletAddress: string, startingBalance: number) {
  // Get current portfolio
  const portfolio = await getWalletPortfolio(walletAddress);

  // Get SOL price
  const solPrice = await getSolPrice();

  // Calculate values
  const currentValueUsd = portfolio.summary.totalUsd;
  const startingValueUsd = startingBalance * solPrice.priceUsd;
  const pnlUsd = currentValueUsd - startingValueUsd;
  const pnlPercent = (pnlUsd / startingValueUsd) * 100;

  // Get trade count
  const trades = await getWalletTrades(walletAddress, {
    parseJupiter: true,
    hideArb: true,
  });

  return {
    currentValue: currentValueUsd,
    startingValue: startingValueUsd,
    pnl: pnlUsd,
    pnlPercent,
    tradeCount: trades.trades.length,
    positions: portfolio.tokens.filter(t => t.balance > 0).length,
  };
}

// Usage
const claudeStats = await calculateAgentPnL(
  'HVyp995fBANWnKPWdB11jBARaMrQqgyJZ6dqFyACi6vv',
  1.0 // 1 SOL starting balance
);

console.log(claudeStats);
// {
//   currentValue: 12481.27,
//   startingValue: 10000,
//   pnl: 2481.27,
//   pnlPercent: 24.81,
//   tradeCount: 12,
//   positions: 3
// }
```

---

## 10. Error Handling

All functions automatically retry on failure. If you want custom handling:

```typescript
try {
  const portfolio = await getWalletPortfolio(walletAddress);
  // Use portfolio
} catch (error) {
  if (error.message.includes('404')) {
    console.error('Wallet not found or has no activity');
  } else if (error.message.includes('429')) {
    console.error('Rate limited (should not happen with paid plan)');
  } else {
    console.error('API error:', error);
  }
}
```

---

## 11. Use in React Components

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getWalletPortfolio } from '@/lib/solanatracker';

export function AgentPortfolio({ walletAddress }: { walletAddress: string }) {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const data = await getWalletPortfolio(walletAddress);
        setPortfolio(data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [walletAddress]);

  if (loading) return <div>Loading...</div>;
  if (!portfolio) return <div>Error loading portfolio</div>;

  return (
    <div>
      <h2>Portfolio Value: ${portfolio.summary.totalUsd.toFixed(2)}</h2>
      <p>Positions: {portfolio.tokens.filter(t => t.balance > 0).length}</p>
    </div>
  );
}
```

---

## 12. Use in API Routes

```typescript
// app/api/agent-stats/route.ts
import { NextResponse } from 'next/server';
import { getWalletPortfolio, getSolPrice } from '@/lib/solanatracker';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet required' }, { status: 400 });
  }

  try {
    const [portfolio, solPrice] = await Promise.all([
      getWalletPortfolio(wallet),
      getSolPrice(),
    ]);

    return NextResponse.json({
      totalUsd: portfolio.summary.totalUsd,
      totalSol: portfolio.summary.totalSol,
      solPrice: solPrice.priceUsd,
      positions: portfolio.tokens.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
```

---

## Rate Limits (Paid Plan)

With your paid plan:
- ✅ No 1 req/s limit
- ✅ Parallel requests allowed
- ✅ Higher monthly quota

Safe to make parallel calls:

```typescript
// Fetch all agents in parallel ✅
const portfolios = await Promise.all([
  getWalletPortfolio(wallet1),
  getWalletPortfolio(wallet2),
  getWalletPortfolio(wallet3),
  // ... all 7 wallets
]);
```

---

## Best Practices

1. **Use Basic endpoints for frequent polling**
   ```typescript
   // Lighter, faster
   const portfolio = await getWalletPortfolioBasic(wallet);
   ```

2. **Batch token metadata requests**
   ```typescript
   // Don't do this:
   const meta1 = await getTokenMetadata(mint1);
   const meta2 = await getTokenMetadata(mint2);

   // Do this instead:
   const metas = await getTokensMetadata([mint1, mint2]);
   ```

3. **Handle empty wallets gracefully**
   ```typescript
   const portfolio = await getWalletPortfolio(wallet);
   if (!portfolio.tokens.length) {
     console.log('New wallet, no holdings yet');
   }
   ```

4. **Cache SOL price for multiple calculations**
   ```typescript
   const solPrice = await getSolPrice();
   // Use solPrice.priceUsd for all calculations in this batch
   ```

---

Need more examples? Check the cron job implementation in `app/api/cron/update-portfolios/route.ts`!
