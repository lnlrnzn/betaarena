import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { createErrorResponse, logger } from '@/lib/logger';

// Verify cron secret for security
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    logger.error('[ADMIN] CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: NextRequest) {
  // Verify authorization
  if (!verifyAuth(request)) {
    logger.error('[ADMIN] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    logger.info('ADMIN', 'Deleting all portfolio snapshots...');

    // Delete all portfolio snapshots
    const { error: deleteError, count } = await supabaseServer
      .from('portfolio_snapshots')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except impossible UUID

    if (deleteError) {
      logger.error('[ADMIN] Error deleting snapshots:', deleteError);
      return NextResponse.json(
        { success: false, ...createErrorResponse(deleteError) },
        { status: 500 }
      );
    }

    logger.info('ADMIN', `Deleted ${count || 'all'} portfolio snapshots`);

    return NextResponse.json({
      success: true,
      deletedCount: count,
      message: 'All portfolio snapshots deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, ...createErrorResponse(error) },
      { status: 500 }
    );
  }
}
