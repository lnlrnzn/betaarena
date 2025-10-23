import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '@/lib/logger';

const execAsync = promisify(exec);

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

    // Execute the parser script
    const { stdout, stderr } = await execAsync(
      'npx tsx scripts/collect-all-declarations.ts',
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          // Ensure environment variables are available
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
        },
        timeout: 120000, // 2 minute timeout
      }
    );

    // Extract summary from output
    const summaryMatch = stdout.match(/Newly inserted:\s+(\d+)/);
    const totalMatch = stdout.match(/Total tweets searched:\s+(\d+)/);
    const validMatch = stdout.match(/Valid declarations found:\s+(\d+)/);

    const newlyInserted = summaryMatch ? parseInt(summaryMatch[1]) : 0;
    const totalSearched = totalMatch ? parseInt(totalMatch[1]) : 0;
    const validFound = validMatch ? parseInt(validMatch[1]) : 0;

    logger.info('CRON', `Parser completed: ${newlyInserted} new declarations inserted`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        totalSearched,
        validFound,
        newlyInserted,
      },
      output: stdout,
      errors: stderr || null,
    });
  } catch (error: any) {
    logger.error('[CRON] Parser execution failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stderr: error.stderr,
        stdout: error.stdout,
      },
      { status: 500 }
    );
  }
}
