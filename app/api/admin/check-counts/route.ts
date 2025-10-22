import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Count team declarations
    const { count: declarationsCount, error: declError } = await supabaseServer
      .from('team_declarations')
      .select('*', { count: 'exact', head: true });

    if (declError) {
      console.error('Error counting declarations:', declError);
    }

    // Count agent activities
    const { count: activitiesCount, error: actError } = await supabaseServer
      .from('agent_activities')
      .select('*', { count: 'exact', head: true });

    if (actError) {
      console.error('Error counting activities:', actError);
    }

    // Count portfolio snapshots
    const { count: snapshotsCount, error: snapError } = await supabaseServer
      .from('portfolio_snapshots')
      .select('*', { count: 'exact', head: true });

    if (snapError) {
      console.error('Error counting snapshots:', snapError);
    }

    return NextResponse.json({
      team_declarations: declarationsCount || 0,
      agent_activities: activitiesCount || 0,
      portfolio_snapshots: snapshotsCount || 0,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
