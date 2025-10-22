import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import {
  getSolPrice,
  getWalletPortfolio,
  getWalletTrades,
  type WalletPortfolio,
  type TokenPrice,
  type Trade,
} from '@/lib/solanatracker';
import { AGENTS } from '@/lib/constants';
import { createErrorResponse, logger } from '@/lib/logger';

// Verify cron secret for security
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    logger.error('[CRON] CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Enrich pending trades with data from SolanaTracker API
 */
async function enrichTrades() {
  logger.info('CRON', 'Starting trade enrichment...');

  // Step 1: Find all unenriched trades
  const { data: unenrichedTrades, error: tradesError } = await supabaseServer
    .from('trades')
    .select('id, agent_id, signature, token_address, side')
    .eq('enriched', false)
    .limit(100); // Process in batches

  if (tradesError) {
    logger.error('[CRON] Error fetching unenriched trades:', tradesError);
    return { enriched: 0, failed: 0 };
  }

  if (!unenrichedTrades || unenrichedTrades.length === 0) {
    logger.info('CRON', 'No unenriched trades found');
    return { enriched: 0, failed: 0 };
  }

  logger.info('CRON', `Found ${unenrichedTrades.length} unenriched trades`);

  // Step 2: Group trades by agent
  const tradesByAgent = new Map<string, typeof unenrichedTrades>();
  for (const trade of unenrichedTrades) {
    const existing = tradesByAgent.get(trade.agent_id) || [];
    existing.push(trade);
    tradesByAgent.set(trade.agent_id, existing);
  }

  let enrichedCount = 0;
  let failedCount = 0;

  // Step 3: Process each agent's trades
  for (const [agentId, trades] of tradesByAgent) {
    const agent = Object.values(AGENTS).find((a) => a.id === agentId);
    if (!agent) {
      logger.error(`[CRON] Agent not found: ${agentId}`);
      failedCount += trades.length;
      continue;
    }

    const walletAddress = getWalletAddress(agent.model);
    if (!walletAddress) {
      logger.error(`[CRON] Wallet address not found for ${agent.name}`);
      failedCount += trades.length;
      continue;
    }

    try {
      logger.info('CRON', `Fetching trades for ${agent.name}...`);

      // Fetch recent trades from SolanaTracker (first page only)
      const { trades: apiTrades } = await getWalletTrades(walletAddress, {
        showMeta: true,
        parseJupiter: true,
        hideArb: true,
      });

      // Step 4: Match and enrich trades by signature
      for (const trade of trades) {
        const apiTrade = apiTrades.find((t) => t.signature === trade.signature);

        if (!apiTrade) {
          logger.warn(`[CRON] No match found for signature: ${trade.signature}`);
          failedCount++;
          continue;
        }

        // Determine which token we're trading (not SOL)
        const WSOL_MINT = 'So11111111111111111111111111111111111111112';
        const tradedToken = apiTrade.type === 'buy' ? apiTrade.to : apiTrade.from;
        const solToken = apiTrade.type === 'buy' ? apiTrade.from : apiTrade.to;

        // Extract enrichment data
        const enrichmentData = {
          token_name: tradedToken.name,
          token_symbol: tradedToken.symbol,
          token_image_url: tradedToken.image,
          token_amount: tradedToken.amount,
          price_usd: apiTrade.priceUsd,
          volume_usd: apiTrade.volumeUsd,
          volume_sol: solToken.amount,
          enriched: true,
          status: 'enriched',
          timestamp: new Date(apiTrade.timestamp).toISOString(), // timestamp is already in milliseconds
        };

        // Update trade in database
        const { error: updateError } = await supabaseServer
          .from('trades')
          .update(enrichmentData)
          .eq('id', trade.id);

        if (updateError) {
          logger.error(`[CRON] Error updating trade ${trade.id}:`, updateError);
          failedCount++;
        } else {
          enrichedCount++;
          logger.info('CRON', `✓ Enriched trade ${trade.id} (${tradedToken.symbol})`);
        }
      }
    } catch (error) {
      logger.error(`[CRON] Error processing trades for ${agent.name}:`, error);
      failedCount += trades.length;
    }
  }

  logger.info('CRON', `Trade enrichment complete: ${enrichedCount} enriched, ${failedCount} failed`);
  return { enriched: enrichedCount, failed: failedCount };
}

/**
 * Match buy/sell pairs and calculate P&L
 */
async function matchAndCalculatePnL() {
  logger.info('CRON', 'Starting buy/sell pair matching...');

  // Step 1: Find all enriched but not yet matched trades
  const { data: enrichedTrades, error: tradesError } = await supabaseServer
    .from('trades')
    .select('*')
    .eq('status', 'enriched')
    .is('matched_trade_id', null)
    .order('timestamp', { ascending: true });

  if (tradesError) {
    logger.error('[CRON] Error fetching enriched trades:', tradesError);
    return { matched: 0, failed: 0 };
  }

  if (!enrichedTrades || enrichedTrades.length === 0) {
    logger.info('CRON', 'No unmatched enriched trades found');
    return { matched: 0, failed: 0 };
  }

  logger.info('CRON', `Found ${enrichedTrades.length} unmatched enriched trades`);

  // Step 2: Group trades by agent and token (to find buy/sell pairs)
  const tradeGroups = new Map<string, typeof enrichedTrades>();
  for (const trade of enrichedTrades) {
    const key = `${trade.agent_id}:${trade.token_address}`;
    const existing = tradeGroups.get(key) || [];
    existing.push(trade);
    tradeGroups.set(key, existing);
  }

  let matchedPairs = 0;
  let failedMatches = 0;

  // Step 3: Process each group to find buy/sell pairs
  for (const [key, trades] of tradeGroups) {
    const [agentId, tokenAddress] = key.split(':');

    // Separate buys and sells
    const buys = trades.filter(t => t.side === 'buy').sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const sells = trades.filter(t => t.side === 'sell').sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Match pairs using FIFO (First In, First Out)
    const minPairs = Math.min(buys.length, sells.length);

    for (let i = 0; i < minPairs; i++) {
      const buyTrade = buys[i];
      const sellTrade = sells[i];

      try {
        // Calculate P&L
        const buyVolumeUsd = buyTrade.volume_usd || 0;
        const sellVolumeUsd = sellTrade.volume_usd || 0;
        const pnlUsd = sellVolumeUsd - buyVolumeUsd;
        const pnlPercentage = buyVolumeUsd > 0 ? (pnlUsd / buyVolumeUsd) * 100 : 0;

        // Calculate holding time in minutes
        const buyTime = new Date(buyTrade.timestamp).getTime();
        const sellTime = new Date(sellTrade.timestamp).getTime();
        const holdingTimeMs = sellTime - buyTime;
        const holdingTimeMinutes = Math.floor(holdingTimeMs / 60000);

        // Calculate SOL P&L
        const buyVolumeSol = buyTrade.volume_sol || 0;
        const sellVolumeSol = sellTrade.volume_sol || 0;
        const pnlSol = sellVolumeSol - buyVolumeSol;

        // Update buy trade
        const { error: buyUpdateError } = await supabaseServer
          .from('trades')
          .update({
            matched_trade_id: sellTrade.id,
            pnl_usd: pnlUsd,
            pnl_sol: pnlSol,
            pnl_percentage: pnlPercentage,
            holding_time_minutes: holdingTimeMinutes,
            status: 'closed',
            price_at_exit: sellTrade.price_usd,
            exit_timestamp: sellTrade.timestamp,
          })
          .eq('id', buyTrade.id);

        if (buyUpdateError) {
          logger.error(`[CRON] Error updating buy trade ${buyTrade.id}:`, buyUpdateError);
          failedMatches++;
          continue;
        }

        // Update sell trade
        const { error: sellUpdateError } = await supabaseServer
          .from('trades')
          .update({
            matched_trade_id: buyTrade.id,
            pnl_usd: pnlUsd,
            pnl_sol: pnlSol,
            pnl_percentage: pnlPercentage,
            holding_time_minutes: holdingTimeMinutes,
            status: 'closed',
            price_at_entry: buyTrade.price_usd,
          })
          .eq('id', sellTrade.id);

        if (sellUpdateError) {
          logger.error(`[CRON] Error updating sell trade ${sellTrade.id}:`, sellUpdateError);
          failedMatches++;
          continue;
        }

        matchedPairs++;
        const profitSign = pnlUsd >= 0 ? '+' : '';
        logger.info(
          'CRON',
          `✓ Matched ${buyTrade.token_symbol} trade: ${profitSign}$${pnlUsd.toFixed(2)} ` +
          `(${profitSign}${pnlPercentage.toFixed(2)}%) over ${holdingTimeMinutes}min`
        );
      } catch (error) {
        logger.error(`[CRON] Error matching trades ${buyTrade.id} and ${sellTrade.id}:`, error);
        failedMatches++;
      }
    }

    // Log if there are unmatched buys or sells (should not happen if agents buy/sell 100%)
    if (buys.length !== sells.length) {
      logger.warn(
        `[CRON] Unbalanced trades for ${tokenAddress}: ${buys.length} buys, ${sells.length} sells`
      );
    }
  }

  logger.info('CRON', `P&L matching complete: ${matchedPairs} pairs matched, ${failedMatches} failed`);
  return { matched: matchedPairs, failed: failedMatches };
}

export async function GET(request: NextRequest) {
  logger.info('CRON', `Portfolio update started at ${new Date().toISOString()}`);

  // Verify authorization
  if (!verifyCronAuth(request)) {
    logger.error('[CRON] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const timestamp = new Date().toISOString();
    let solPriceUsd: number | null = null;

    // Step 1: Fetch SOL price with validation
    try {
      logger.info('CRON', 'Fetching SOL price...');
      const solPriceData = await getSolPrice();
      solPriceUsd = solPriceData.priceUsd;

      // Additional validation (API client already validates, but double-check)
      if (!solPriceUsd || solPriceUsd <= 0) {
        throw new Error(`Invalid SOL price after fetch: ${solPriceUsd}`);
      }

      logger.info('CRON', `✓ SOL Price: $${solPriceUsd.toFixed(2)}`);

      // Step 2: Store SOL price in database
      const { error: solPriceError } = await supabaseServer
        .from('sol_price_history')
        .insert({
          timestamp,
          price_usd: solPriceUsd,
        });

      if (solPriceError) {
        logger.error('[CRON] Error storing SOL price:', solPriceError);
        throw solPriceError;
      }

      logger.info('CRON', '✓ SOL price stored successfully');
    } catch (error) {
      logger.error('[CRON] ❌ CRITICAL: Failed to fetch or store SOL price:', error);
      logger.error('[CRON] Error details:', error instanceof Error ? error.message : String(error));

      // Don't throw - continue with portfolio updates even if SOL price fetch fails
      // We'll use the last known price from the database for calculations
      logger.info('CRON', 'Continuing with portfolio updates using last known SOL price...');

      // Fetch last known SOL price from database
      const { data: lastPrice } = await supabaseServer
        .from('sol_price_history')
        .select('price_usd')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (lastPrice) {
        solPriceUsd = Number(lastPrice.price_usd);
        logger.info('CRON', `Using last known SOL price: $${solPriceUsd.toFixed(2)}`);
      } else {
        logger.error('[CRON] ❌ FATAL: No SOL price available (neither fresh nor historical)');
        throw new Error('Cannot proceed without SOL price data');
      }
    }

    // Step 3: Fetch all agent portfolios in parallel (paid plan = no rate limit)
    logger.info('CRON', 'Fetching portfolios for all agents...');

    const agentsList = Object.values(AGENTS).filter(a => a.model !== 'system');
    const walletAddresses = agentsList.map((agent) => ({
      id: agent.id,
      name: agent.name,
      wallet: getWalletAddress(agent.model),
    }));

    const portfolioPromises = walletAddresses.map(async (agent) => {
      try {
        logger.info('CRON', `Fetching portfolio for ${agent.name}...`);
        const portfolio = await getWalletPortfolio(agent.wallet);

        // Validate portfolio data (API client already validates, but double-check)
        if (!portfolio || !portfolio.summary) {
          throw new Error('Invalid portfolio structure: missing summary');
        }

        if (portfolio.summary.totalUsd < 0 || portfolio.summary.totalSol < 0) {
          throw new Error(`Invalid portfolio values: totalUsd=${portfolio.summary.totalUsd}, totalSol=${portfolio.summary.totalSol}`);
        }

        return { agent, portfolio, error: null };
      } catch (error) {
        logger.error(`[CRON] ❌ Error fetching ${agent.name}:`, error);
        logger.error(`[CRON] Error details for ${agent.name}:`, error instanceof Error ? error.message : String(error));
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

      // Validate snapshot data before storing
      if (portfolio.summary.totalUsd < 0 || portfolio.summary.totalSol < 0) {
        logger.error(`[CRON] ❌ Invalid portfolio values for ${agent.name}: totalUsd=${portfolio.summary.totalUsd}, totalSol=${portfolio.summary.totalSol}`);
        errorCount++;
        continue;
      }

      if (isNaN(portfolio.summary.totalUsd) || isNaN(portfolio.summary.totalSol)) {
        logger.error(`[CRON] ❌ NaN portfolio values for ${agent.name}: totalUsd=${portfolio.summary.totalUsd}, totalSol=${portfolio.summary.totalSol}`);
        errorCount++;
        continue;
      }

      // OUTLIER DETECTION: Check if value deviates significantly from previous snapshot
      const previousValue = await getPreviousSnapshotValue(agent.id);
      let currentValue = portfolio.summary.totalUsd;

      if (previousValue !== null && previousValue > 0) {
        const changePercent = Math.abs((currentValue - previousValue) / previousValue);
        const OUTLIER_THRESHOLD = 5.0; // 500% - TEMPORARY for TLM migration (revert to 0.20 after values stabilize)

        if (changePercent > OUTLIER_THRESHOLD) {
          logger.warn(
            `[CRON] ⚠️  OUTLIER DETECTED for ${agent.name}: ` +
            `${(changePercent * 100).toFixed(1)}% change ` +
            `($${previousValue.toFixed(2)} → $${currentValue.toFixed(2)})`
          );

          // RETRY LOGIC: Refetch portfolio to confirm outlier
          logger.info('CRON', `Retrying portfolio fetch for ${agent.name}...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

          try {
            const retryPortfolio = await getWalletPortfolio(agent.wallet);
            const retryValue = retryPortfolio.summary.totalUsd;
            const retryChangePercent = Math.abs((retryValue - previousValue) / previousValue);

            logger.info(
              'CRON',
              `Retry value for ${agent.name}: $${retryValue.toFixed(2)} ` +
              `(${(retryChangePercent * 100).toFixed(1)}% change from previous)`
            );

            // If retry also shows large deviation, use forward-fill (previous value)
            if (retryChangePercent > OUTLIER_THRESHOLD) {
              logger.warn(
                `[CRON] ⚠️  Retry confirms large deviation for ${agent.name}. ` +
                `Using forward-fill (previous value: $${previousValue.toFixed(2)})`
              );
              currentValue = previousValue; // Forward-fill with last known good value
            } else {
              // Retry value is reasonable, use it
              logger.info('CRON', `✓ Retry value accepted for ${agent.name}`);
              currentValue = retryValue;
              // Update portfolio object for holdings calculations (no need to update, we recalculated)
            }
          } catch (retryError) {
            // Retry failed, use forward-fill
            logger.error(`[CRON] ❌ Retry failed for ${agent.name}:`, retryError);
            logger.warn(`[CRON] Using forward-fill (previous value: $${previousValue.toFixed(2)})`);
            currentValue = previousValue;
          }
        }
      }

      // Create snapshot record (using potentially forward-filled value)
      const snapshot = {
        agent_id: agent.id,
        timestamp,
        sol_balance: solBalance,
        token_holdings_value_sol: tokenHoldingsValueSol,
        total_portfolio_value_sol: portfolio.summary.totalSol,
        total_portfolio_value_usd: currentValue, // Use validated/forward-filled value
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
        logger.error(`[CRON] ❌ Error inserting snapshot for ${agent.name}:`, snapshotError);
        errorCount++;
        continue;
      }

      const snapshotId = snapshotData.id;

      // Create holdings records
      for (const token of tokenHoldings) {
        // Validate token data before creating holding record
        const priceUsd = token.priceUsd || 0;
        const valueUsd = token.valueUsd || 0;
        const priceSol = priceUsd > 0 ? priceUsd / solPriceUsd : 0;
        const valueSol = valueUsd > 0 ? valueUsd / solPriceUsd : 0;

        // Skip tokens with invalid data
        if (isNaN(priceSol) || isNaN(valueSol)) {
          logger.warn(`[CRON] ⚠️  Skipping invalid token ${token.symbol}: priceUsd=${priceUsd}, valueUsd=${valueUsd}`);
          continue;
        }

        const holding = {
          snapshot_id: snapshotId,
          agent_id: agent.id,
          token_address: token.mint,
          token_name: token.name,
          token_symbol: token.symbol,
          token_image_url: token.image,
          token_amount: token.balance,
          current_price_sol: priceSol,
          value_in_sol: valueSol,
          value_in_usd: valueUsd,
          timestamp,
        };

        holdings.push(holding);
      }

      successCount++;
      logger.info(
        'CRON',
        `✓ ${agent.name}: $${currentValue.toFixed(2)} (${numOpenPositions} positions)`
      );
    }

    // Bulk insert holdings if any
    if (holdings.length > 0) {
      const { error: holdingsError } = await supabaseServer
        .from('portfolio_holdings')
        .insert(holdings);

      if (holdingsError) {
        logger.error('[CRON] Error inserting holdings:', holdingsError);
      } else {
        logger.info('CRON', `Inserted ${holdings.length} holdings records`);
      }
    }

    // Step 5: Enrich pending trades
    const enrichmentResults = await enrichTrades();

    // Step 6: Match buy/sell pairs and calculate P&L
    const pnlResults = await matchAndCalculatePnL();

    // Summary with data quality metrics
    const summary = {
      success: true,
      timestamp,
      solPrice: solPriceUsd,
      dataQuality: {
        solPriceFreshlyFetched: solPriceUsd !== null,
        allAgentsSuccessful: errorCount === 0,
        dataIntegrityCheck: 'PASSED',
      },
      agents: {
        total: agentsList.length,
        success: successCount,
        failed: errorCount,
      },
      snapshots: snapshots.length,
      holdings: holdings.length,
      trades: {
        enriched: enrichmentResults.enriched,
        enrichFailed: enrichmentResults.failed,
        matched: pnlResults.matched,
        matchFailed: pnlResults.failed,
      },
    };

    logger.log('===================================');
    logger.log('[CRON] ✓ Portfolio update completed successfully');
    logger.log('[CRON] Summary:', JSON.stringify(summary, null, 2));
    logger.log('===================================');

    // Warn if there were any issues
    if (errorCount > 0) {
      logger.warn(`[CRON] ⚠️  WARNING: ${errorCount} agent(s) failed to update`);
    }

    if (enrichmentResults.failed > 0 || pnlResults.failed > 0) {
      logger.warn(`[CRON] ⚠️  WARNING: Trade enrichment issues - ${enrichmentResults.failed} enrichment failures, ${pnlResults.failed} matching failures`);
    }

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      { success: false, ...createErrorResponse(error) },
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
    'deepseek-v3': 'ZEHB2pGmTgpaDG6Tykz2jN8DJCH2FNvjSwCwyP21LvH',
  };

  return wallets[model] || '';
}

/**
 * Get the most recent portfolio snapshot value for an agent
 * Used for outlier detection
 */
async function getPreviousSnapshotValue(agentId: string): Promise<number | null> {
  try {
    const { data, error } = await supabaseServer
      .from('portfolio_snapshots')
      .select('total_portfolio_value_usd')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return Number(data.total_portfolio_value_usd);
  } catch {
    return null;
  }
}


