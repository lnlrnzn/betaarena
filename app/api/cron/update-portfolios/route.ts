import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import {
  getSolPrice,
  getWalletPortfolio,
  type WalletPortfolio,
  type TokenPrice,
} from '@/lib/solanatracker';
import { AGENTS } from '@/lib/constants';

// Verify cron secret for security
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  console.log('[CRON] Portfolio update started at', new Date().toISOString());

  // Verify authorization
  if (!verifyCronAuth(request)) {
    console.error('[CRON] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Step 1: Fetch SOL price
    console.log('[CRON] Fetching SOL price...');
    const solPriceData = await getSolPrice();
    const solPriceUsd = solPriceData.priceUsd;
    const timestamp = new Date().toISOString();

    console.log(`[CRON] SOL Price: $${solPriceUsd}`);

    // Step 2: Store SOL price in database
    const { error: solPriceError } = await supabaseServer
      .from('sol_price_history')
      .insert({
        timestamp,
        price_usd: solPriceUsd,
      });

    if (solPriceError) {
      console.error('[CRON] Error storing SOL price:', solPriceError);
      throw solPriceError;
    }

    // Step 3: Fetch all agent portfolios in parallel (paid plan = no rate limit)
    console.log('[CRON] Fetching portfolios for all agents...');

    const agentsList = Object.values(AGENTS);
    const walletAddresses = agentsList.map((agent) => ({
      id: agent.id,
      name: agent.name,
      wallet: getWalletAddress(agent.model),
    }));

    const portfolioPromises = walletAddresses.map(async (agent) => {
      try {
        console.log(`[CRON] Fetching portfolio for ${agent.name}...`);
        const portfolio = await getWalletPortfolio(agent.wallet);
        return { agent, portfolio, error: null };
      } catch (error) {
        console.error(`[CRON] Error fetching ${agent.name}:`, error);
        return { agent, portfolio: null, error };
      }
    });

    const portfolioResults = await Promise.all(portfolioPromises);

    // Step 4: Process and store portfolio data
    const snapshots = [];
    const holdings = [];
    let successCount = 0;
    let errorCount = 0;

    for (const result of portfolioResults) {
      if (!result.portfolio || result.error) {
        errorCount++;
        continue;
      }

      const { agent, portfolio } = result;

      // Calculate SOL balance (find wSOL token)
      const wSOL_MINT = 'So11111111111111111111111111111111111111112';
      const solToken = portfolio.tokens.find((t) => t.mint === wSOL_MINT);
      const solBalance = solToken?.balance || 0;

      // Calculate token holdings value (excluding SOL)
      const tokenHoldings = portfolio.tokens.filter(
        (t) => t.mint !== wSOL_MINT && t.balance > 0
      );
      const tokenHoldingsValueUsd = tokenHoldings.reduce(
        (sum, t) => sum + t.valueUsd,
        0
      );
      const tokenHoldingsValueSol = tokenHoldingsValueUsd / solPriceUsd;

      // Number of open positions
      const numOpenPositions = tokenHoldings.length;

      // Create snapshot record
      const snapshot = {
        agent_id: agent.id,
        timestamp,
        sol_balance: solBalance,
        token_holdings_value_sol: tokenHoldingsValueSol,
        total_portfolio_value_sol: portfolio.summary.totalSol,
        total_portfolio_value_usd: portfolio.summary.totalUsd,
        unrealized_pnl_sol: 0, // Calculate based on cost basis
        unrealized_pnl_usd: 0,
        realized_pnl_sol: 0,
        realized_pnl_usd: 0,
        num_open_positions: numOpenPositions,
      };

      snapshots.push(snapshot);

      // Insert snapshot first to get snapshot_id
      const { data: snapshotData, error: snapshotError } = await supabaseServer
        .from('portfolio_snapshots')
        .insert(snapshot)
        .select('id')
        .single();

      if (snapshotError) {
        console.error(`[CRON] Error inserting snapshot for ${agent.name}:`, snapshotError);
        errorCount++;
        continue;
      }

      const snapshotId = snapshotData.id;

      // Create holdings records
      for (const token of tokenHoldings) {
        const holding = {
          snapshot_id: snapshotId,
          agent_id: agent.id,
          token_address: token.mint,
          token_name: token.name,
          token_symbol: token.symbol,
          token_image_url: token.image,
          token_amount: token.balance,
          current_price_sol: token.priceUsd / solPriceUsd,
          value_in_sol: token.valueUsd / solPriceUsd,
          value_in_usd: token.valueUsd,
          timestamp,
        };

        holdings.push(holding);
      }

      successCount++;
      console.log(
        `[CRON] ✓ ${agent.name}: $${portfolio.summary.totalUsd.toFixed(2)} (${numOpenPositions} positions)`
      );
    }

    // Bulk insert holdings if any
    if (holdings.length > 0) {
      const { error: holdingsError } = await supabaseServer
        .from('portfolio_holdings')
        .insert(holdings);

      if (holdingsError) {
        console.error('[CRON] Error inserting holdings:', holdingsError);
      } else {
        console.log(`[CRON] Inserted ${holdings.length} holdings records`);
      }
    }

    // Summary
    const summary = {
      success: true,
      timestamp,
      solPrice: solPriceUsd,
      agents: {
        total: agentsList.length,
        success: successCount,
        failed: errorCount,
      },
      snapshots: snapshots.length,
      holdings: holdings.length,
    };

    console.log('[CRON] Portfolio update completed:', summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('[CRON] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper function to get wallet address for each agent
function getWalletAddress(model: string): string {
  const wallets: Record<string, string> = {
    'claude-sonnet-4.5': 'HVyp995fBANWnKPWdB11jBARaMrQqgyJZ6dqFyACi6vv',
    'gpt-5': '4isFg6MFZDt1YYYAFFSgtY2fiMSKx82ueT5njMENTCDJ',
    'gemini-2.5-pro': 'G2rtrpkeRbTi8qw6SBdi76n2JmX9RP57zSc5aR8k1c1t',
    'grok-4': 'GKUAXXonViVJHzjrr6pXMC4WBKj5CuQYwhMgkTEYY79H',
    'qwen-3-max': 'FceruJvabLcKNg2KpD36HZYSxRWoDAqFvEeiGYDHHWpn',
    'glm-4.6': '3QkvrLMiGGAaj2eMpB7MafWQ5rDLgzeeWMibA3f55T71',
    'mistral-large': 'ZEHB2pGmTgpaDG6Tykz2jN8DJCH2FNvjSwCwyP21LvH',
  };

  return wallets[model] || '';
}


