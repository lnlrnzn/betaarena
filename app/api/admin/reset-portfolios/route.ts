import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Verify cron secret for security
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: NextRequest) {
  // Verify authorization
  if (!verifyAuth(request)) {
    console.error('[ADMIN] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[ADMIN] Deleting all portfolio snapshots...');

    // Delete all portfolio snapshots
    const { error: deleteError, count } = await supabaseServer
      .from('portfolio_snapshots')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except impossible UUID

    if (deleteError) {
      console.error('[ADMIN] Error deleting snapshots:', deleteError);
      return NextResponse.json({
        success: false,
        error: deleteError.message
      }, { status: 500 });
    }

    console.log(`[ADMIN] ✓ Deleted ${count || 'all'} portfolio snapshots`);

    return NextResponse.json({
      success: true,
      deletedCount: count,
      message: 'All portfolio snapshots deleted successfully'
    });
  } catch (error) {
    console.error('[ADMIN] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
