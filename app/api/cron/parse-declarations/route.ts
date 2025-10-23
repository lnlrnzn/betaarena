import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { runDeclarationsParser } from '@/scripts/collect-all-declarations';

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
 * Cron job to parse new Twitter team declarations
 * Runs the collect-all-declarations.ts script
 */
export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    logger.info('CRON', 'Starting Twitter declarations parser...');

    // Run the parser directly
    const results = await runDeclarationsParser();

    logger.info('CRON', `Parser completed: ${results.newlyInserted} new declarations inserted`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        totalSearched: results.totalSearched,
        validFound: results.validFound,
        alreadyInDb: results.alreadyInDb,
        newlyInserted: results.newlyInserted,
      },
    });
  } catch (error: any) {
    logger.error('[CRON] Parser execution failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
